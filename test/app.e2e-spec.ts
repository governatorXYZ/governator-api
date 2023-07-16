import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import jestOpenAPI from 'jest-openapi';
import { configure } from '../src/app.config';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { constants, dtos, mocks } from './mocks';
import { VoteMongoService } from '../src/vote/vote.mongo.service';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import _ from 'lodash';
import { PollCronService } from '../src/poll/poll.cron.service';
import { Strategy, StrategyDocument } from '../src/web3/strategy/strategy.schema';
import { SchedulerRegistry } from '@nestjs/schedule';
import { fixtures } from './fixtures';
import { REDIS } from '../src/redis/redis.constants';
import { Redis } from 'ioredis';
import { getQueueToken } from '@nestjs/bull';
  

describe('e2e testing of governator server', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    let server: any;
    const API_KEY = process.env.API_KEY;
    let pollId: string;
    let strategies: any;
    let redis: Redis;
    let pollQueue: any;
    let voteQueue: any;

    beforeAll(async () => {

        moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(mocks.schedulerRegistryMock.provide)
            .useValue(mocks.schedulerRegistryMock.useValue)
            .overrideProvider(mocks.pollCronServiceMock.provide)
            .useValue(mocks.pollCronServiceMock.useValue)
            .overrideProvider(mocks.userServiceMock.provide)
            .useValue(mocks.userServiceMock.useValue)
            .compile();

        app = moduleFixture.createNestApplication();

        // Configure the app as in production and setup OpenAPI testing
        jestOpenAPI(configure(app, false));

        await app.init();

        const strategyModel = moduleFixture.get<Model<StrategyDocument>>(getModelToken(Strategy.name));

        redis = moduleFixture.get(REDIS);

        pollQueue = moduleFixture.get(getQueueToken('poll-create'));
        voteQueue = moduleFixture.get(getQueueToken('vote-create'));

        strategies = await strategyModel.find().lean().exec();

        server = app.getHttpServer().listen(process.env.API_PORT);

        // console.log(server)
    });
      
    describe('auth', () => {

        const publicEndpoints = [
            '/api/swagger-ui-init.js',
            '/api/api/swagger-ui-init.js',
            '/api',
            '/api/',
            '/api-json',
            '/api-yaml',
        ];

        const ouathEndpoints = [
            '/api/auth/login',
            '/api/auth/logout',
            '/api/auth/redirect',
        ];

        // TODO:
        // const discordOAuthEndpoints = [
        //     'auth/session',
        //     'auth/discord/servers',
        // ];

        it('should fail with 401 (unauthorized) if no authentication is provided', async () => {
    
            const router = server._events.request._router;
    
            const availableRoutes: Record<string, string>[] = router.stack
                .map(layer => {
                    if (layer.route) {
                        return {
                            path: layer.route?.path,
                            method: layer.route?.stack[0].method,
                        };
                    }
                })
                .filter(item => item !== undefined && !publicEndpoints.includes(item.path));
    
            const apiKeyRoutes = availableRoutes.filter(item => !ouathEndpoints.includes(item.path));
        
            for (const route of apiKeyRoutes) {
                if (route.method === 'get') {
                    await request(server)
                        .get(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
                
                if (route.method === 'post') {
                    await request(server)
                        .post(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'patch') {
                    await request(server)
                        .patch(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'delete') {
                    await request(server)
                        .delete(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
            }
        });

        it('should fail with 401 (unauthorized) if incorrect authentication is provided', async () => {

            const key = 'wrong key';
    
            const router = server._events.request._router;
    
            const availableRoutes: Record<string, string>[] = router.stack
                .map(layer => {
                    if (layer.route) {
                        return {
                            path: layer.route?.path,
                            method: layer.route?.stack[0].method,
                        };
                    }
                })
                .filter(item => item !== undefined && !publicEndpoints.includes(item.path));
    
            const apiKeyRoutes = availableRoutes.filter(item => !ouathEndpoints.includes(item.path));
        
            for (const route of apiKeyRoutes) {
                if (route.method === 'get') {
                    await request(server)
                        .get(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
                
                if (route.method === 'post') {
                    await request(server)
                        .post(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'patch') {
                    await request(server)
                        .patch(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'delete') {
                    await request(server)
                        .delete(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
            }
        }, 50000);

        it('should pass with 200 (OK) if correct authentication is provided', async () => {
    
            await request(server)
                .get('/api/poll/list')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .expect(HttpStatus.OK);
        });

        it('should pass with 302 (found) on oauth routes', async () => {
        
            for (const path of ouathEndpoints) {
                await request(server)
                    .get(path)
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.FOUND);
            }
        });
    });

    describe('create poll and vote', () => {

        it('should be defined', () => {

            const strategyModel = moduleFixture.get<Model<StrategyDocument>>(getModelToken(Strategy.name));

            const pollCronService = moduleFixture.get<PollCronService>(PollCronService);

            const schedulerRegistry = moduleFixture.get<SchedulerRegistry>(SchedulerRegistry);

            const voteMongoService = moduleFixture.get<VoteMongoService>(VoteMongoService);

            expect(redis).toBeDefined();

            expect(strategyModel).toBeDefined();

            expect(pollCronService).toBeDefined();

            expect(schedulerRegistry).toBeDefined();
        
            expect(voteMongoService).toBeDefined();
        });


        it('should create a new poll', async () => {

            const { strategy_config, ...pollCreateDto } = dtos.pollCreateDto;

            strategy_config[0].block_height = [{ block: 17548235, chain_id: '1' }];
            strategy_config[0].strategy_id = strategies.find(strategy => strategy.name === 'Standard (1 Vote = 1 Vote)')._id;

            pollCreateDto.strategy_config = strategy_config;

            const res = await request(server)
                .post('/api/poll/create')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(dtos.pollCreateDto)
                .expect(HttpStatus.CREATED);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { updatedAt, createdAt, ...response } = res.body;

            const pollFixture = fixtures.poll;

            pollFixture.end_time = response.end_time;
            pollFixture._id = response._id;

            expect(response).toEqual(pollFixture);

            pollId = response._id;

        }, 10000);

        it('should create / update / delete a vote', async () => {

            // const spyModel = moduleFixture.get<Model<VoteDocument>>(getModelToken(Vote.name));

            const expected1 = fixtures.voteCreate;

            expected1.data.poll_id = pollId;

            const res1 = await request(server)
                .post(`/api/vote/${pollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(dtos.voteRequestDto)
                .expect(HttpStatus.CREATED);

            const result1 = res1.body[0];

            delete result1.data.createdAt;

            delete result1.data.updatedAt;

            expected1.data._id = result1.data._id;

            expect(result1).toEqual(expected1);

            const updateRequest = dtos.voteRequestDto;
            updateRequest.poll_option_id = '110631fa-3fbb-41c9-8718-b26ca4a40af5';

            const res2 = await request(server)
                .post(`/api/vote/${pollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(updateRequest)
                .expect(HttpStatus.CREATED);

            const result2 = res2.body[0];

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { createdAt: cr1, updatedAt: up1, ...oldVote } = result2.data.oldVote;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { createdAt: cr2, updatedAt: up2, ...updatedVote } = result2.data.updatedVote;

            const expected2 = _.clone(expected1.data);
            expected2.poll_option_id = updateRequest.poll_option_id;

            expect(oldVote).toEqual(expected1.data);
            expect(updatedVote).toEqual(expected2);

            const res3 = await request(server)
                .post(`/api/vote/${pollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(updateRequest)
                .expect(HttpStatus.CREATED);

            const result3 = res3.body[0];

            delete result3.data.createdAt;

            delete result3.data.updatedAt;

            const expected3 = fixtures.voteDelete;

            expected3.data.poll_id = pollId;

            expected3.data._id = result1.data._id;

            expect(result3).toEqual(expected3);

            // expect(spyModel.create).toHaveBeenCalled();
        });

    });

    describe('Test token strategies', () => {
        it('should vote correct amount on BANK strategy', async () => {
            const holder = '0xd78cdb879acc67b000588b027328af4626f0b0ef';
            const mainnetBlock = 17618186;
            const mainnetBank = 553917772312377856244804n;
            const polygonBank = 733421074177719425655939n;

            // generate pollCreateDto with BANK strategy
            const { strategy_config, ...pollCreateDto } = dtos.pollCreateDto;
            strategy_config[0].block_height = [{ block: mainnetBlock, chain_id: '1' }];
            strategy_config[0].strategy_id = strategies.find(strategy => strategy.name === 'BANK - Token Weighted')._id;
            pollCreateDto.strategy_config = strategy_config;

            // create poll in db - we do a full request to make sure equivalent block height is updated before db create
            const pollResult = await request(server)
                .post('/api/poll/create')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(pollCreateDto)
                .expect(HttpStatus.CREATED);

            const bankPollId = pollResult.body._id;
            expect(bankPollId).toBeDefined();

            // send vote request
            const bankVoteRequestDto = {
                poll_option_id: 'ad271e7c-1554-41a3-a0ff-ba6f7f54cdb4',
                account_id: holder,
                provider_id: constants.providers[1],
            };

            const voteResponse = await request(server)
                .post(`/api/vote/${bankPollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(bankVoteRequestDto)
                .expect(HttpStatus.CREATED);

            // result matches known value of account at mainnet block specified in poll
            expect(BigInt(voteResponse.body[0].data.vote_power)).toEqual(mainnetBank + polygonBank);

        }, 200000);

        it('should vote correct amount on BANKLESS DAO membership strategy', async () => {
            const holder = '0xd78cdb879acc67b000588b027328af4626f0b0ef';
            const mainnetBlock = 17618186;

            // generate pollCreateDto with BANK strategy
            const { strategy_config, ...pollCreateDto } = dtos.pollCreateDto;
            strategy_config[0].block_height = [{ block: mainnetBlock, chain_id: '1' }];
            strategy_config[0].strategy_id = strategies.find(strategy => strategy.name === 'BanklessDAO Membership')._id;
            pollCreateDto.strategy_config = strategy_config;

            // create poll in db - we do a full request to make sure equivalent block height is updated before db create
            const pollResult = await request(server)
                .post('/api/poll/create')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(pollCreateDto)
                .expect(HttpStatus.CREATED);

            const bankPollId = pollResult.body._id;
            expect(bankPollId).toBeDefined();

            // send vote request
            const bankVoteRequestDto = {
                poll_option_id: 'ad271e7c-1554-41a3-a0ff-ba6f7f54cdb4',
                account_id: holder,
                provider_id: constants.providers[1],
            };

            const voteResponse = await request(server)
                .post(`/api/vote/${bankPollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(bankVoteRequestDto)
                .expect(HttpStatus.CREATED);

            // result is 1, independent of account balance
            expect(voteResponse.body[0].data.vote_power).toEqual('1');

            // delete the holder account from user and vote again
            const filteredAccounts = fixtures.user.provider_accounts.filter(account => account._id !== holder);
            fixtures.user.provider_accounts = filteredAccounts;

            // vote again with different address
            const bankVoteRequestDto2 = {
                poll_option_id: 'ad271e7c-1554-41a3-a0ff-ba6f7f54cdb4',
                account_id: '0x33ad3066B03Dd0f3956645621Bbee859a4F6cacE',
                provider_id: constants.providers[1],
            };

            const voteResponse2 = await request(server)
                .post(`/api/vote/${bankPollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(bankVoteRequestDto2)
                .expect(HttpStatus.CREATED);

            // no voting power
            expect(voteResponse2.body).toEqual([]);

        }, 200000);
    });

    afterAll(async () => {
        await pollQueue.close();
        await voteQueue.close();
        redis.disconnect();
        await moduleFixture.close();
        await app.close();
    });
});
