import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import jestOpenAPI from 'jest-openapi';
import { configure } from '../src/app.config';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { constants, dtos, mocks, defaultMockRepository } from './mocks';
import { VoteMongoService } from '../src/vote/vote.mongo.service';
import { Vote, VoteDocument } from '../src/vote/vote.schema';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import _ from 'lodash';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
// import { closeInMongodConnection, rootMongooseTestModule } from './mongod-in-memory';
import { PollCronService } from '../src/poll/poll.cron.service';
import mongoose from 'mongoose';
import {
    NestApplicationBuilder,
} from '@jbiskur/nestjs-test-utilities';
  

describe('e2e testing of governator server', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    let server: any;
    const API_KEY = process.env.API_KEY;

    beforeAll(async () => {

        // mock return value mongodb create for Poll model
        const pollMockRepository = _.clone(defaultMockRepository);
        pollMockRepository.create = jest.fn(async () => dtos.pollResponseDto);
        pollMockRepository.find = () => {
            return { exec: jest.fn(async () => [dtos.pollResponseDto]) };
        };
        pollMockRepository.findById = () => {
            return { exec: jest.fn(async () => dtos.pollResponseDto) };
        };

        const pollMockRepositoryProvider = _.clone(mocks.pollMockRepository);
        pollMockRepositoryProvider.useValue = pollMockRepository;

        // mock return value of mongodb find / findOne for Startegy model
        const strategyMockRepository = _.clone(defaultMockRepository);
        strategyMockRepository.findOne = () => {
            return { exec: jest.fn(async () => dtos.strategyResponseDto) };
        };
        strategyMockRepository.find = () => {
            return { exec: jest.fn(async () => [dtos.strategyResponseDto]) };
        };

        const strategyMockRepositoryProvider = _.clone(mocks.strategyMockRepository);
        strategyMockRepositoryProvider.useValue = strategyMockRepository;

        // app = await new NestApplicationBuilder()
        //     .withTestModule((builder) => builder.withModule(TestModuleA))
        //     .overrideModule(TestModuleA, ModuleToOverride, MockedModule)
        //     .build();

        moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(strategyMockRepositoryProvider.provide)
            .useValue(strategyMockRepositoryProvider.useValue)
            // .overrideProvider(pollMockRepositoryProvider.provide)
            // .useValue(pollMockRepositoryProvider.useValue)
            .overrideProvider(mocks.schedulerRegistryMock.provide)
            .useValue(mocks.schedulerRegistryMock.useValue)
            .overrideProvider(mocks.pollCronServiceMock.provide)
            .useValue(mocks.pollCronServiceMock.useValue)
            .overrideProvider(mocks.mongooseModuleMock.provide)
            .useValue(mocks.mongooseModuleMock.useValue)
            .compile();

        app = moduleFixture.createNestApplication();

        // Configure the app as in production and setup OpenAPI testing
        jestOpenAPI(configure(app, false));

        await app.init();

        // const strategyModel = moduleFixture.get<Model<StrategyDocument>>(getModelToken(Strategy.name));


        // console.log(await strategyModel.findOne({ _id: '8997a1efa5dc2a3ddfe3f37f5df29d95' }));

        server = app.getHttpServer();
    });
      
    xdescribe('auth', () => {

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

            const voteMongoService = moduleFixture.get<VoteMongoService>(VoteMongoService);
        
            expect(voteMongoService).toBeDefined();
        });

        it('should create a new poll', async () => {

            const res = await request(server)
                .post('/api/poll/create')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(dtos.pollCreateDto)
                .expect(HttpStatus.CREATED);

            expect(res.body).toEqual(dtos.pollResponseDto);

        }, 10000);

        xit('should create a new vote', async () => {

            const spyModel = moduleFixture.get<Model<VoteDocument>>(getModelToken(Vote.name));

            await request(server)
                .post(`/api/vote/${constants.pollId}`)
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .send(dtos.voteRequestDto)
                .expect(HttpStatus.CREATED);

            expect(spyModel.create).toHaveBeenCalled();
        });

    });


    // xit('tests a valid vote request', async () => {

    //     // console.log(app.getUrl());

    //     await request(server)
    //         // .post(`/vote/${constants.pollId}`)
    //         .get('/api/user/list')
    //         .set('Accept', 'application/json')
    //         // .set('X-API-KEY', process.env.API_KEY)
    //         // .send(dtos.voteRequestDto)
    //         .expect(HttpStatus.OK);
    // });


    afterAll(async () => {
        await app.close();
        await mongoose.disconnect();
    }, 10000);
});
