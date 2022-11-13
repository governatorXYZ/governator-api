import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { VoteCreateDto, VoteRawResponseDto, VoteRequestDto } from './vote.dto';
import { Poll } from '../poll/poll.schema';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/user.dtos';
import { strategyTypes } from '../common/constants';
import { VoteMongoService } from './vote.mongo.service';
import { PollMongoService } from '../poll/poll.mongo.service';
import { StrategyMongoService } from '../web3/strategy/strategy.mongo.service';
import { StrategyRequestDto } from '../web3/strategy/strategy.dtos';
import { BigNumber, ethers } from 'ethers';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class VoteRequestHandlerService {
    private readonly logger = new Logger(VoteRequestHandlerService.name);

    constructor(
        private pollService: PollMongoService,
        private userService: UserService,
        private voteMongoService: VoteMongoService,
        private strategyMongoService: StrategyMongoService,
    ) {
        // do nothing
    }

    // Methods in this file are handling vote logic and should not be accessed by other public endpoints
    async validateVoteRequest(pollId: string, voteRequestDto: VoteRequestDto) {

        if (process.env.NODE_ENV === 'development') this.logger.log(`Attempting to validate vote request for pollID: ${pollId}, with request body: ${JSON.stringify(voteRequestDto)}`);

        this.logger.debug('Validating Poll ID');
        const poll = await this.getPoll(pollId);
        if (!poll) throw new HttpException('Poll not found', HttpStatus.CONFLICT);
        this.logger.debug('Poll ID is valid');

        this.logger.debug('Validating User account');
        const user = await this.getUser(voteRequestDto);
        if (!user) throw new HttpException('User not found', HttpStatus.CONFLICT);
        this.logger.debug('User ID is valid');

        this.logger.debug('Checking if account has already voted on this poll');
        const accountVotes = await this.voteMongoService.fetchVoteByAccount(pollId, voteRequestDto.account_id);
        if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] length: ${Object.keys(accountVotes).length}`);
        if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] ${JSON.stringify(accountVotes)}`);

        this.logger.debug('Calculating vote powers');
        const multiStrategyVotePower = await this.calculateVotePower(voteRequestDto, poll);

        if (process.env.NODE_ENV === 'development') this.logger.debug(`multiStrategyVotePower (summed up vote power per strategy) ${JSON.stringify(multiStrategyVotePower)}`);

        this.logger.debug('Preparing voteCreateDto');

        /* ---------------------------------------------------------------------------------------------------------- */
        /* TODO MVP implementation of multi strategy logic: If there is a ONE_EQUALS_ONE strategy defined in the polls
        *   strategy_config array, it supersedes all other strategies. If there is none, the first TOKEN_WEIGHTED
        *   strategy is used. This will be updated along with strategy template engine implementation */
        let voteCreateDto: VoteCreateDto;
        const simpleStrat = poll.strategy_config.find((stratConf) => stratConf.strategy_type === strategyTypes.STRATEGY_TYPE_ONE_EQUALS_ONE);
        const firstTokenStrat = poll.strategy_config.find((stratConf) => stratConf.strategy_type === strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED);
        if (simpleStrat) {
            voteCreateDto = { ...voteRequestDto, poll_id: pollId, vote_power: multiStrategyVotePower[simpleStrat.strategy_id] };
        } else if (firstTokenStrat) {
            if (multiStrategyVotePower[firstTokenStrat.strategy_id] === '0') throw new HttpException('Vote power has to be bigger than 0', HttpStatus.CONFLICT);
            voteCreateDto = { ...voteRequestDto, poll_id: pollId, vote_power: multiStrategyVotePower[firstTokenStrat.strategy_id] };
        }
        /* ---------------------------------------------------------------------------------------------------------- */

        if (process.env.NODE_ENV === 'development') this.logger.debug(`voteCreateDto: VoteCreateDto: ${JSON.stringify(voteCreateDto)}`);

        if(accountVotes.length === 0) {
            this.logger.debug('first time vote of user/platform on this poll');
            return await this.voteMongoService.createVote(voteCreateDto);
        }

        const isDuplicate = this.isDuplicateVote(accountVotes, voteCreateDto);

        if(accountVotes.length > 0) {
            this.logger.debug('not a first-time vote, user/platform has voted on this poll before');

            if (isDuplicate) return this.voteMongoService.deleteVote(voteCreateDto);

            if (!isDuplicate) {
                // poll is single vote type --> update vote
                if (poll.single_vote) return this.voteMongoService.updateVote(voteCreateDto);

                // poll is multi vote type --> create vote
                if (!poll.single_vote) {
                    // TODO: implement multiple options voting for token voting
                    if (poll.strategy_config.some(strategyConf => strategyConf.strategy_type === strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED)) {
                        this.logger.debug('multiple vote options not yet supported on token weighted strategies');
                        return;

                    } else {
                        return await this.voteMongoService.createVote(voteCreateDto);

                    }
                }
            }
        }
    }

    /* TODO: MVP implementation for running token weighted strategies. Due to the way the strategy templates are
    *   implemented, this method makes a http call to our own endpoint. This will change with future implementation
    *   of strategy templates. */
    async calculateVotePower(voteRequestDto: VoteRequestDto, poll: Poll) {
        const userAccounts = (await this.getUser(voteRequestDto)).provider_accounts;
        const votePowerPerStrategy = {};
        let existingPower: BigNumber;

        for (const strategyConf of poll.strategy_config) {

            for (const account of userAccounts) {

                if (process.env.NODE_ENV === 'development') this.logger.log(`processing account ${JSON.stringify(account)}`);
                let strategyEndpoint: string;
                let strategyRequestDto: StrategyRequestDto;
                let votePowerOfAccount: void | AxiosResponse;

                switch(strategyConf.strategy_type) {

                case strategyTypes.STRATEGY_TYPE_ONE_EQUALS_ONE:
                    if (!(account.provider_id === 'discord')) break;
                    votePowerPerStrategy[strategyConf.strategy_id] = '1';
                    break;

                case strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED:
                    if (!(account.provider_id === 'ethereum')) break;
                    strategyEndpoint = (await this.strategyMongoService.findManyStrategy({ _id: strategyConf.strategy_id }))[0].endpoint;
                    strategyRequestDto = { account_id: account._id, block_height: strategyConf.block_height };

                    if (votePowerPerStrategy[strategyConf.strategy_id]) {
                        existingPower = ethers.BigNumber.from(votePowerPerStrategy[strategyConf.strategy_id]);
                    } else {
                        existingPower = ethers.BigNumber.from('0');
                    }

                    votePowerOfAccount = await axios.post(
                        `http://localhost:${process.env.PORT}/${process.env.API_GLOBAL_PREFIX}/${strategyEndpoint}`,
                        strategyRequestDto,
                        {
                            transformResponse: (r) => r,
                            headers: { 'X-API-KEY': process.env.API_KEY, accept: 'application/json', 'Content-Type': 'application/json' },
                        },
                    ).catch(e => {
                        if (process.env.NODE_ENV === 'development') this.logger.error(JSON.stringify(e));
                    });

                    if (!votePowerOfAccount) return;

                    if (process.env.NODE_ENV === 'development') this.logger.log((votePowerOfAccount as AxiosResponse).data);

                    votePowerPerStrategy[strategyConf.strategy_id] = existingPower.add(ethers.BigNumber.from(votePowerOfAccount.data));
                    break;
                }
            }
        }

        // transform BigNumber values back to string
        Object.keys(votePowerPerStrategy).map((key) => {
            const value = votePowerPerStrategy[key];
            votePowerPerStrategy[key] = value.toString();
        });
        return votePowerPerStrategy;
    }

    isDuplicateVote(accountVotes: VoteRawResponseDto[], voteCreateDto: VoteCreateDto): boolean {
        const voteOptions: string[] = [];
        accountVotes.map((vote) => voteOptions.push(vote.poll_option_id));
        this.logger.debug('checking if vote is a duplicate');
        if (process.env.NODE_ENV === 'development') this.logger.debug(`IsDuplicateVote ${voteOptions} ; ${voteCreateDto.poll_option_id} --> ${voteOptions.includes(voteCreateDto.poll_option_id)}`);
        return voteOptions.includes(voteCreateDto.poll_option_id);
    }

    async getPoll(pollId): Promise<Poll> {
        try {
            const poll = await this.pollService.fetchPollById(pollId);
            this.logger.debug('POLL found ', poll);
            return poll;

        } catch (e) {
            this.logger.error('Invalid Poll ID', e);

            throw new HttpException('Invalid Poll ID', HttpStatus.CONFLICT);
        }
    }

    async getUser(voteRequestDto: VoteRequestDto): Promise<UserResponseDto> {
        try {
            const user = await this.userService.fetchUserByProvider(voteRequestDto.provider_id, voteRequestDto.account_id);
            this.logger.debug('USER found ');
            return user;

        } catch (e) {
            this.logger.error('Invalid User ID', e);

            throw new HttpException('Invalid User ID', HttpStatus.CONFLICT);
        }
    }


}
