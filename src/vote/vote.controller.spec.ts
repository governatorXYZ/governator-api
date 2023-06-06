import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { VoteRequestDto } from './vote.dtos';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('Test VoteController', () => {

    const testPollId = '999a8681e47db28bf0000222';
    const testUserId = '999a8681e47db28bf0000111';
    const PROVIDER_DISCORD = 'discord';
    const PROVIDER_ETHEREUM = 'ethereum';

    const testVoteRequest: VoteRequestDto = {
        poll_option_id: uuidv4(),
        account_id: 'A',
        provider_id: PROVIDER_DISCORD,
    };

    let voteController: VoteController;
    beforeEach(async () => {

        // class VoteMongoServiceMock {
        //     // eslint-disable-next-line
        //     fetchVoteByPollCountAggregate(pollId) {return true; }
        //     validateVoteRequest() { return true; }
        //     // eslint-disable-next-line
        //     fetchVoteByPoll(pollId) { return true; }
        //     // eslint-disable-next-line
        //     fetchVoteByPollAggregate(pollId) { return true; }
        //     // eslint-disable-next-line
        //     fetchVoteByPollAndUserVotePowerAggregate(poll_id, user_id) { return true; }
        //     // eslint-disable-next-line
        //     fetchVoteByPollAndUserAggregate(pollId, userId) { return true; }
        //     // eslint-disable-next-line
        //     fetchVoteByPollSumAggregate(pollId) { return true; }
        //     // eslint-disable-next-line

        //     fetchVoteUserCount(pollId) { return true; }

        // }

        // Mock mongo service response
        // const MongoFake = {
        //     provide: VoteMongoService,
        //     useClass: VoteMongoServiceMock,
        // };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [VoteController],
            // providers: [MongoFake],
        })
            .useMocker((token) => {
                // const results = ['test1', 'test2'];
                // if (token === CatsService) {
                //     return { findAll: jest.fn().mockResolvedValue(results) };
                // }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
                    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
                    return new Mock();
                }
            })
            .compile();

        voteController = moduleFixture.get<VoteController>(VoteController);
    });

    it('checks if controller invokes VoteMongoService', async () => {

        expect(await voteController.createVote(testPollId, testVoteRequest)).toBe(true);
        expect(await voteController.fetchVoteByPollCountAggregate(testPollId)).toBe({
            aggregate: true,
            votes: true,
        });
        expect(await voteController.fetchVoteByPollAndUserCountAggregate(testPollId, testUserId)).toEqual(true);
        expect(await voteController.fetchVoteByPollSumAggregate(testPollId)).toBe({
            aggregate: true,
            votes: true,
        });
    });
});

describe('Validation Unit Tests - test DTO against nestjs validation pipeline', () => {

    it('tests validation pipeline - using VoteRequestDto', async () => {

        const testVote = {
            user_id: '999a8681e47db28bf0000111',
            poll_option_id: 'A',
        };

        const testVoteInvalidUserId = {
            user_id: 'invalid ID',
            poll_option_id: 'A',
        };

        const testVoteInvalidPollOption = {
            user_id: 'invalid ID',
            poll_option_id: 1,
        };

        const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: VoteRequestDto,
            data: '',
        };

        // valid
        await expect(target.transform(testVote, metadata)).resolves.toEqual(testVote);

        // violates user ID constraint
        await expect(target.transform(testVoteInvalidUserId, metadata)).rejects.toThrowError();

        // violates Poll Option constraint
        await expect(target.transform(testVoteInvalidPollOption, metadata)).rejects.toThrowError();
    });
});