import { HttpException, HttpStatus, Injectable, Logger, CACHE_MANAGER, Inject } from '@nestjs/common';
import { VoteCreateDto, VoteRawResponseDto, VoteRequestDto, VoteResponseDto } from './vote.dtos';
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
import { StrategyConfig } from 'src/poll/poll.dtos';

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

    async onApplicationBootstrap(): Promise<void> {
        if (Number(process.env.CACHE)) {
            this.logger.debug('Caching all active Polls');

            const now = new Date(Date.now());

            try {
                const polls = await this.pollService.fetchAllPolls({ end_time : {
                    $gte: now.toISOString(),
                } });

                polls.forEach((poll) => {
                    this.cacheVotePowersByPoll(poll);
                });

            } catch (e) {
                this.logger.error('Failed to fetch polls from db', e);

                throw new HttpException('Failed to fetch polls from db', HttpStatus.BAD_REQUEST);
            }
        }
    }


    // Methods in this file are handling vote logic and should not be accessed by other public endpoints
    async handleVoteRequest(pollId: string, voteRequestDto: VoteRequestDto): Promise<VoteResponseDto[]> {
        
        const { poll, user } = await this.validate(pollId, voteRequestDto);
        
        const voteCreateDtos: VoteCreateDto[] = [];

        const strategyConf = poll.strategy_config[0];

        for (const account of user.provider_accounts) {

            if (process.env.NODE_ENV === 'development') this.logger.log(`Processing vote request of account ${JSON.stringify(account)}`);
            let cachedVotePower: string;
            let votePower: string;

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

                this.logger.warn(account.provider_id);

                if (Number(process.env.CACHE) === 1) {
                    cachedVotePower = await this.getCachedVotePower(account.provider_id, account._id, pollId);
                    votePower = cachedVotePower ? cachedVotePower :
                        await this.setCachedVotePower(
                            account.provider_id,
                            account._id,
                            poll,
                            await this.runTokenStrategy(strategyConf, account),
                        );
                } else {
                    votePower = await this.runTokenStrategy(strategyConf, account);
                }

                voteCreateDtos.push({
                    ...voteRequestDto,
                    vote_power: votePower,
                    poll_id: poll._id,
                    provider_id: account.provider_id,
                    account_id: account._id,
                });

                break;
            }
        }

        return this.createBatchVotes(voteCreateDtos, poll);
    }

    async validate(pollId: string, voteRequestDto: VoteRequestDto): Promise<{ poll: Poll, user: UserResponseDto }> {

        if (process.env.NODE_ENV === 'development') this.logger.log(`Attempting to validate vote request for pollID: ${pollId}, with request body: ${JSON.stringify(voteRequestDto)}`);

        this.logger.debug('Validating Poll ID');
        const poll = await this.getPoll(pollId);
        if (!poll) throw new HttpException('Poll not found', HttpStatus.CONFLICT);
        this.logger.debug('Poll ID is valid');

        this.logger.debug('Validating User account');
        const user = await this.getUser(voteRequestDto);
        if (!user) throw new HttpException('User not found', HttpStatus.CONFLICT);
        this.logger.debug('User ID is valid');

        return { poll, user };
    }

    async getCachedVotePower(accountProviderId: string, accountId: string, pollId: string): Promise<string> {

        const key = Utils.formatCacheKey(accountProviderId, accountId, pollId);

        const votePower = await this.cacheManager.get(key);

        if (process.env.NODE_ENV === 'development') this.logger.debug(`Key ${key}`);

        if (process.env.NODE_ENV === 'development') this.logger.debug(`Vote power from cache ${votePower}`);

        return votePower;

    }

    async setCachedVotePower(accountProviderId: string, accountId: string, poll: Poll, votePower: string): Promise<string> {
        const key = Utils.formatCacheKey(accountProviderId, accountId, poll._id);

        // TODO cache-manager v4 uses seconds, needs to be changed to ms when upgrade to cache-manager v5
        const ttl = (new Date(poll.end_time).getTime() - new Date(Date.now()).getTime()) / 1000;

        this.logger.debug(`caching vote power of account ${accountId}`);
        this.logger.debug(`setting cache with key: ${key} value: ${votePower} ttl: ${ttl}`);

        await this.cacheManager.set(key, votePower, ttl);

        return votePower;
    }

    /* TODO: MVP implementation for running token weighted strategies. Due to the way the strategy templates are
    *   implemented, this method makes a http call to our own endpoint. This will change with future implementation
    *   of strategy templates. */
    async runTokenStrategy(strategyConf: StrategyConfig, account: (EthereumAccountResponseDto | DiscordAccountResponseDto)): Promise<string> {
        const strategyEndpoint = (await this.strategyMongoService.findManyStrategy({ _id: strategyConf.strategy_id }))[0].endpoint;
        const strategyRequestDto: StrategyRequestDto = { account_id: account._id, block_height: strategyConf.block_height };

        const votePowerOfAccount = await axios.post(
            `http://localhost:${process.env.PORT}/${process.env.API_GLOBAL_PREFIX}/${strategyEndpoint}`,
            strategyRequestDto,
            {
                transformResponse: (r) => r,
                headers: { 'X-API-KEY': process.env.API_KEY, accept: 'application/json', 'Content-Type': 'application/json' },
            },
        ).catch(e => {
            if (process.env.NODE_ENV === 'development') this.logger.error(JSON.stringify(e));
        });

        if ((!votePowerOfAccount) || !votePowerOfAccount.data) return;

        if (process.env.NODE_ENV === 'development') this.logger.debug(`Vote power from strategy ${(votePowerOfAccount as AxiosResponse).data}`);

        return votePowerOfAccount.data;
    }

    async createBatchVotes(voteCreateDtos: VoteCreateDto[], poll: Poll): Promise<VoteResponseDto[]> {
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

    isDuplicateVote(accountVotes: VoteRawResponseDto[], voteCreateDto: VoteCreateDto): boolean {
        const voteOptions: string[] = [];
        accountVotes.map((vote) => voteOptions.push(vote.poll_option_id));
        this.logger.debug('checking if vote is a duplicate');
        if (process.env.NODE_ENV === 'development') this.logger.debug(`IsDuplicateVote ${voteOptions} ; ${voteCreateDto.poll_option_id} --> ${voteOptions.includes(voteCreateDto.poll_option_id)}`);
        return voteOptions.includes(voteCreateDto.poll_option_id);
    }

    async getPoll(pollId: string): Promise<Poll> {
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

                const cached = await this.getCachedVotePower(account.provider_id, account._id, poll._id);

                if (cached) continue;
                
                const votePower = await this.runTokenStrategy(poll.strategy_config[0], account);

                this.setCachedVotePower(account.provider_id, account._id, poll, votePower);
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
                },
            },
        });

        this.logger.debug(`caching vote power of acccount ${account._id} for polls ${polls.map(poll => poll._id)}`);

        if(!polls.length || polls.length === 0) return;

        polls.forEach(async (poll) => {
            if (!(account.provider_id === 'ethereum')) return;

            const cached = await this.getCachedVotePower(account.provider_id, account._id, poll._id);

            if (cached) return;
                
            const votePower = await this.runTokenStrategy(poll.strategy_config[0], account);

            this.setCachedVotePower(account.provider_id, account._id, poll, votePower);
        });
    }
}
