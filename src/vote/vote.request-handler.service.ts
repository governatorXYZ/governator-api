import { HttpException, HttpStatus, Injectable, Logger, CACHE_MANAGER, Inject } from '@nestjs/common';
import { VoteCreateDto, VoteRawResponseDto, VoteRequestDto, VoteResponseDto } from './vote.dto';
import { Poll } from '../poll/poll.schema';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/user.dtos';
import { strategyTypes } from '../common/constants';
import { VoteMongoService } from './vote.mongo.service';
import { PollMongoService } from '../poll/poll.mongo.service';
import { StrategyMongoService } from '../web3/strategy/strategy.mongo.service';
import { StrategyRequestDto } from '../web3/strategy/strategy.dtos';
import axios, { AxiosResponse } from 'axios';
import { DiscordAccountResponseDto, EthereumAccountResponseDto } from '../account/account.dtos';
import { Cache } from 'cache-manager';
import Utils from '../common/utils';
import { EthereumAccount } from 'src/account/ethereumAccount.schema';

@Injectable()
export class VoteRequestHandlerService {
    private readonly logger = new Logger(VoteRequestHandlerService.name);

    constructor(
        private pollService: PollMongoService,
        private userService: UserService,
        private voteMongoService: VoteMongoService,
        private strategyMongoService: StrategyMongoService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

        this.logger.debug('Calculating vote powers');
        const voteCreateDtos: VoteCreateDto[] = await this.calculateVotePowers(voteRequestDto, poll, user.provider_accounts);
        if (process.env.NODE_ENV === 'development') this.logger.debug(`Following votes will be recorded (voteCreateDtos): \n${JSON.stringify(voteCreateDtos)}`);
        if (voteCreateDtos.length === 0) return [];

        return await this.createBatchVotes(voteCreateDtos, poll);
    }

    async createBatchVotes(voteCreateDtos: VoteCreateDto[], poll: Poll) {
        const voteResponseDtos: VoteResponseDto[] = [];

        // we have one voteCreateDto per account
        for (const voteCreateDto of voteCreateDtos) {

            this.logger.debug('Checking if account has already voted on this poll');
            const accountVotes = await this.voteMongoService.fetchVoteByAccount(voteCreateDto.poll_id, voteCreateDto.account_id);
            if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] length: ${Object.keys(accountVotes).length}`);
            if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] ${JSON.stringify(accountVotes)}`);

            if(accountVotes.length === 0) {
                this.logger.debug('first time vote of account on this poll');

                voteCreateDto.vote_power != '0' ? voteResponseDtos.push(await this.voteMongoService.createVote(voteCreateDto)) : 0;

            } else if(accountVotes.length > 0) {
                const isDuplicate = this.isDuplicateVote(accountVotes, voteCreateDto);

                this.logger.debug('not a first-time vote, account has voted on this poll before');

                if (isDuplicate) voteCreateDto.vote_power != '0' ? voteResponseDtos.push(await this.voteMongoService.deleteVote(voteCreateDto)) : 0;

                if (!isDuplicate) {
                    // poll is single vote type --> update vote
                    if (poll.single_vote) voteCreateDto.vote_power != '0' ? voteResponseDtos.push(await this.voteMongoService.updateVote(voteCreateDto)) : 0;

                    // poll is multi vote type --> create vote
                    if (!poll.single_vote) {
                        voteCreateDto.vote_power != '0' ? voteResponseDtos.push(await this.voteMongoService.createVote(voteCreateDto)) : 0;
                    }
                }
            }
        }
        return voteResponseDtos;
    }

    /* TODO: MVP implementation for running token weighted strategies. Due to the way the strategy templates are
    *   implemented, this method makes a http call to our own endpoint. This will change with future implementation
    *   of strategy templates. */
    async calculateVotePowers(voteRequestDto: VoteRequestDto, poll: Poll, userAccounts: (EthereumAccountResponseDto | DiscordAccountResponseDto)[]): Promise<VoteCreateDto[]> {
        const voteCreateDtos: VoteCreateDto[] = [];

        for (const strategyConf of poll.strategy_config) {

            for (const account of userAccounts) {

                if (process.env.NODE_ENV === 'development') this.logger.debug(`processing account ${JSON.stringify(account)}`);
                let strategyEndpoint: string;
                let strategyRequestDto: StrategyRequestDto;
                let votePowerOfAccount: void | AxiosResponse;
                let key: string;
                let cachedVotePower: string;

                switch(strategyConf.strategy_type) {

                case strategyTypes.STRATEGY_TYPE_ONE_EQUALS_ONE:
                    if (!(account.provider_id === 'discord')) break;

                    voteCreateDtos.push({
                        ...voteRequestDto,
                        vote_power: '1',
                        poll_id: poll._id,
                        provider_id: account.provider_id,
                        account_id: account._id,
                    });
                    break;

                case strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED:
                    if (!(account.provider_id === 'ethereum')) break;

                    key = Utils.formatCacheKey(account.provider_id, account._id, poll._id);

                    cachedVotePower = await this.cacheManager.get(key);

                    if (Number(process.env.CACHE) === 1 && cachedVotePower) {
                        this.logger.debug(`getting vote power from cache key: ${key} value: ${cachedVotePower}`);
                        voteCreateDtos.push({
                            ...voteRequestDto,
                            vote_power: cachedVotePower,
                            poll_id: poll._id,
                            provider_id: account.provider_id,
                            account_id: account._id,
                        });
                        break;
                    }

                    strategyEndpoint = (await this.strategyMongoService.findManyStrategy({ _id: strategyConf.strategy_id }))[0].endpoint;
                    strategyRequestDto = { account_id: account._id, block_height: strategyConf.block_height };

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

                    voteCreateDtos.push({
                        ...voteRequestDto,
                        vote_power: (votePowerOfAccount as AxiosResponse).data,
                        poll_id: poll._id,
                        provider_id: account.provider_id,
                        account_id: account._id,
                    });
                    break;
                }
            }
        }

        this.logger.log('votes calculated successfully');

        return voteCreateDtos;
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

    async cacheVotePowersByPoll(poll: Poll): Promise<void> {
        if(!poll.strategy_config.find((conf) => conf.strategy_type === strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED)) return;

        const users = await this.userService.fetchAllUsers();

        users.forEach(async (user) => {
            for (const account of user.provider_accounts) {

                if (!(account.provider_id === 'ethereum')) continue;

                this.setVotePowerCache(poll, account as EthereumAccountResponseDto);
            }
        });
    }

    async cacheVotePowersByAccount(account: EthereumAccountResponseDto): Promise<void> {

        const polls = await this.pollService.fetchAllPolls({
            end_time: {
                $gt:  new Date(Date.now()),
            },
            strategy_config: {
                $elemMatch: {
                    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
                }
            }
        });

        this.logger.debug(`caching vote power of acccount ${account._id} for polls ${polls.map(poll => poll._id)}`);

        if(!polls.length || polls.length === 0) return;

        polls.forEach(async (poll) => {

            this.setVotePowerCache(poll, account);
        });
    }

    async setVotePowerCache(poll: Poll, account: EthereumAccountResponseDto) {

        let voteRequestDto: VoteRequestDto;

        const key = Utils.formatCacheKey(account.provider_id, account._id, poll._id);

        if (await this.cacheManager.get(key)) return;

        const ttl = new Date(poll.end_time).getTime() - new Date(Date.now()).getTime();

        if (account.provider_id === 'ethereum') {
            voteRequestDto = {
                account_id: account._id,
                poll_option_id: poll.poll_options[0].poll_option_id,
                provider_id: account.provider_id,
            };

            this.calculateVotePowers(voteRequestDto, poll, [account])
                .then(
                    (votePowers) => {
                        votePowers.forEach(async (votePower) => {
                            this.logger.debug(`caching vote power of account ${account._id}`);
                            this.logger.debug(`setting cache with key: ${key} value: ${votePower.vote_power} ttl: ${ttl}`);
                            await this.cacheManager.set(key, votePower.vote_power, ttl);
                        });
                    },
                );
        }
    }
}
