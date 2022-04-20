import { Test, TestingModule } from '@nestjs/testing';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { VoteRequestDto } from './vote.dto';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

describe('Test VoteController', () => {

    const testPollId = '999a8681e47db28bf0000222';
    const testUserId = '999a8681e47db28bf0000111';

    const testVoteRequest: VoteRequestDto = {
        user_id: '999a8681e47db28bf0000111',
        poll_option_id: 'A',
    };

    let voteController: VoteController;
    // let mockSseService: any;
    beforeEach(async () => {

        class VoteMongoServiceMock {
            validateVoteRequest() { return true; }
            // eslint-disable-next-line
            fetchVoteByPoll(pollId) { return true; }
            // eslint-disable-next-line
            fetchVoteByPollAndUser(pollId, userId) { return true; }
        }

        // Mock mongo service response
        const MongoFake = {
            provide: VoteMongoService,
            useClass: VoteMongoServiceMock,
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [VoteController],
            providers: [MongoFake],
        }).compile();

        voteController = moduleFixture.get<VoteController>(VoteController);
    });

    it('checks if controller invokes VoteMongoService', async () => {

        expect(await voteController.createVote(testPollId, testVoteRequest)).toBe(true);
        expect(await voteController.fetchVoteByPoll(testPollId)).toEqual(true);
        expect(await voteController.fetchVoteByPollAndUser(testPollId, testUserId)).toEqual(true);
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