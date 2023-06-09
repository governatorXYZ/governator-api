import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from '../vote.controller';
import { VoteMongoService } from '../vote.mongo.service';
import { VoteRequestDto } from '../vote.dtos';
import { ArgumentMetadata, forwardRef, INestApplication, ValidationPipe } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { VoteCreateConsumer } from '../vote.q.consumer.service';
import { VoteCreateProducer } from '../vote.q.producer.service';
import { VoteRequestHandlerService } from '../vote.request-handler.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { VoteModule } from '../vote.module';
import { PollModule } from '../../poll/poll.module';
import { PollMongoService } from '../../poll/poll.mongo.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserModule } from '../../user/user.module';
import { mock } from 'jest-mock-extended';
import { DoneCallback, Queue } from 'bull';
import { SseModule } from '../../sse/sse.module';
import { SseService } from '../../sse/sse.service';
import { of } from 'rxjs';

import { constants, dtos, mocks } from '../../../test/mocks';


const moduleMocker = new ModuleMocker(global);

describe('Test VoteController', () => {

    let voteController: VoteController;
    let moduleFixture: TestingModule;
    let voteCreateProducer: VoteCreateProducer;
    let voteCreateConsumer: VoteCreateConsumer;
    let mockQueue: any;
    let app: INestApplication;

    beforeEach(async () => {

        class VoteMongoServiceMock {
            // eslint-disable-next-line
            fetchVoteByPollCountAggregate(pollId) {return true; }
            validateVoteRequest() { return true; }
            // eslint-disable-next-line
            fetchVoteByPoll(pollId) { return true; }
            // eslint-disable-next-line
            fetchVoteByPollAggregate(pollId) { return true; }
            // eslint-disable-next-line
            fetchVoteByPollAndUserVotePowerAggregate(poll_id, user_id) { return true; }
            // eslint-disable-next-line
            fetchVoteByPollAndUserAggregate(pollId, userId) { return true; }
            // eslint-disable-next-line
            fetchVoteByPollSumAggregate(pollId) { return true; }
            // eslint-disable-next-line
            fetchVoteUserCount(pollId) { return true; }

        }

        class PollMongoServiceMock {
        }

        class VoteRequestHandlerServiceMock {
        }

        // class VoteCreateProducerMock {
        // }

        class VoteCreateConsumerMock {
            getReturnValueFromObservable = jest.fn().mockResolvedValue(true);
        }

        class SseServiceMock {
            emit(_data) {return true;}
            // eventStream: true;
        }

        // Mock mongo service response
        const PollMongoFake = {
            provide: PollMongoService,
            useClass: PollMongoServiceMock,
        };

        const VoteMongoFake = {
            provide: VoteMongoService,
            useClass: VoteMongoServiceMock,
        };

        const VoteRequestHandlerFake = {
            provide: VoteRequestHandlerService,
            useClass: VoteRequestHandlerServiceMock,
        };

        // const VoteCreateProducerFake = {
        //     provide: VoteCreateProducer,
        //     useClass: VoteCreateProducerMock,
        // };

        const VoteCreateConsumerFake = {
            provide: VoteCreateConsumer,
            useClass: VoteCreateConsumerMock,
        };

        const SseServiceFake = {
            provide: SseService,
            useClass: SseServiceMock,
        };

        // const processor = (_, complete: DoneCallback) => {
        //     complete();
        //     // done();
        // };

        moduleFixture = await Test.createTestingModule({
            imports: [BullModule.registerQueue({
                name: 'vote-create',
                limiter: {
                    max: 50,
                    duration: 1000,
                },
                // processors: [processor],
            }),
            ],
            controllers: [VoteController],
            providers: [VoteCreateProducer, VoteCreateConsumer, SseService],
        })
            .useMocker((token) => {
                if (token === VoteRequestHandlerService) {
                    return { handleVoteRequest: jest.fn().mockImplementation((jobId: string, voteRequest: VoteRequestDto) => {
                        console.log(jobId);
                        console.log(voteRequest);
                        return new Promise(() => dtos.voteResponseDto);
                    }) };
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .compile();
        
        await moduleFixture.init();

        // app = moduleFixture.createNestApplication();
        // app.useGlobalPipes(
        //     new ValidationPipe({
        //         transform: true,
        //         whitelist: true,
        //         forbidNonWhitelisted: true,
        //         enableDebugMessages: true,
        //     }),
        // );
        // await app.init();

        voteCreateProducer = moduleFixture.get<VoteCreateProducer>(VoteCreateProducer);
        voteCreateConsumer = moduleFixture.get<VoteCreateConsumer>(VoteCreateConsumer);
        voteController = moduleFixture.get<VoteController>(VoteController);
    });

    afterAll(async () => {
       
        await app.close();
     
    });

    it('triggers job processor', async () => {
        // await voteCreateProducer.voteCreateJob('1', testVoteRequest);

        const result = await voteController.createVote(constants.pollId, dtos.voteRequestDto);

        // const job = await voteCreateProducer.voteCreateJob('1', dtos.voteRequestDto);
        // // console.log(await queue.getActiveCount());
        // // console.log(await queue.getWaitingCount());
        // // queue.empty()
        // // console.log(queue.clean());
        // const result = await job.finished();
        // console.log(result);

        // const queue = job.queue;
        // queue.empty();

        expect(result).toEqual(dtos.voteResponseDto);

        // await new Promise<void>(res => voteCreateProducer.voteCreateJob('1', dtos.voteRequestDto).then(job => job.finished().then(result => {
        //     expect(result).toEqual(0);
        //     res();
        // })));
  
        // expect(mockQueue.add).toBeCalledTimes(1);
    }, 50000);

    xit('invokes associated services', async () => {

        const processor = (_, complete: DoneCallback) => {
            complete();
            // done();
        };

        moduleFixture = await Test.createTestingModule({
            imports: [BullModule.registerQueue({
                name: 'vote-create',
                limiter: {
                    max: 50,
                    duration: 1000,
                },
                processors: [processor],
            }),
            ],
            controllers: [VoteController],
            providers: [VoteCreateProducer, VoteCreateConsumer, SseService],
        })
            .useMocker((token) => {
                if (token === VoteRequestHandlerService) {
                    return { handleVoteRequest: jest.fn().mockImplementation((jobId: string, voteRequest: VoteRequestDto) => {
                        console.log(jobId);
                        console.log(voteRequest);
                        return new Promise(() => dtos.voteResponseDto);
                    }) };
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .compile();

        const queue = moduleFixture.get<Queue>(getQueueToken('vote-create'));
        const job = await queue.add({ test: true });
        await job.finished();
        await moduleFixture.close();

        return;
        // jest.spyOn(voteCreateConsumer, 'getReturnValueFromObservable').mockImplementation((_a) => {
        //     return new Promise(() => {return {};});
        // });
        // jest.doMock('SseService', () => ({
        //     eventStream: of(true),
        // }));

        // await voteController.createVote(testPollId, testVoteRequest);
        // expect(voteCreateConsumer.getReturnValueFromObservable).toBeCalledTimes(1);

        // expect(await voteController.createVote(testPollId, testVoteRequest)).toBe(true);

        // expect(await voteController.fetchVoteByPollCountAggregate(testPollId)).toEqual({
        //     aggregate: true,
        //     votes: true,
        // });
        // expect(await voteController.fetchVoteByPollAndUserCountAggregate(testPollId, testUserId)).toEqual(true);
        // expect(await voteController.fetchVoteByPollSumAggregate(testPollId)).toEqual({
        //     aggregate: true,
        //     votes: true,
        // });
    }, 10000);
});