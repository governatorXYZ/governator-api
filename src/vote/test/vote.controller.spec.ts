import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from '../vote.controller';
import { VoteRequestDto } from '../vote.dtos';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { VoteCreateConsumer } from '../vote.q.consumer.service';
import { VoteCreateProducer } from '../vote.q.producer.service';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { mock } from 'jest-mock-extended';
import { Queue } from 'bull';

import { constants, dtos, mocks } from '../../../test/mocks';

const moduleMocker = new ModuleMocker(global);

describe('Test VoteController', () => {

    let voteController: VoteController;
    let moduleFixture: TestingModule;
    let voteCreateConsumer: VoteCreateConsumer;
    let mockQueue: any;

    beforeEach(async () => {

        mockQueue = mock<Queue>();
        mockQueue.add.mockReturnValue(1);

        moduleFixture = await Test.createTestingModule({
            imports: [BullModule.registerQueue({
                name: 'vote-create',
            })],
            controllers: [VoteController],
            providers: [VoteCreateProducer, mocks.voteMongoServiceMock],
        })
            .useMocker((token) => {
                if (token === VoteCreateConsumer) {
                    return { getReturnValueFromObservable: jest.fn().mockResolvedValue(true) };
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .overrideProvider(getQueueToken('vote-create'))
            .useValue(mockQueue)
            .compile();

        voteCreateConsumer = moduleFixture.get<VoteCreateConsumer>(VoteCreateConsumer);
        
        voteController = moduleFixture.get<VoteController>(VoteController);
    });

    describe('Test vote creation (createVote())', () => {
        it('triggers producer and adds job to the queue', async () => {
        
            await voteController.createVote(constants.pollId, dtos.voteRequestDto);
    
            expect(mockQueue.add).toBeCalledTimes(1);
        });
    
        it('attaches to consumer (observable) to receive job return value', async () => {
    
            expect(await voteController.createVote(constants.pollId, dtos.voteRequestDto)).toBe(true);
    
            expect(voteCreateConsumer.getReturnValueFromObservable).toBeCalledTimes(1);
        });
    
        it('invokes VoteMongoService', async () => {
    
            expect(await voteController.fetchVoteByPollCountAggregate(constants.pollId)).toEqual({
                aggregate: true,
                votes: true,
            });
    
            expect(await voteController.fetchVoteByPollAndUserCountAggregate(constants.pollId, constants.userId)).toEqual(true);
    
            expect(await voteController.fetchVoteByPollSumAggregate(constants.pollId)).toEqual({
                aggregate: true,
                votes: true,
            });
        });

    });

});

describe('Validation Unit Tests - test DTO against nestjs validation pipeline', () => {

    it('tests validation pipeline - using VoteRequestDto', async () => {

        const validVoteDiscord = dtos.voteRequestDto;

        const validVoteEthereum = {
            ...validVoteDiscord,
            provider_id: constants.providers[1],
        };

        const invalidPollOption = {
            ...validVoteDiscord,
            poll_option_id: 'not a uuid',
        };

        const invalidProvider = {
            ...validVoteDiscord,
            provider_id: 'not a valid provider',
        };

        const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: VoteRequestDto,
            data: '',
        };

        // valid
        await expect(target.transform(validVoteDiscord, metadata)).resolves.toEqual(validVoteDiscord);
        await expect(target.transform(validVoteEthereum, metadata)).resolves.toEqual(validVoteEthereum);

        // violates Poll Option constraint
        await expect(target.transform(invalidPollOption, metadata)).rejects.toThrowError('Bad Request Exception');

        // violates provider constraint
        await expect(target.transform(invalidProvider, metadata)).rejects.toThrowError('Bad Request Exception');
    });
});