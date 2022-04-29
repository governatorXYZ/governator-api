import { Test, TestingModule } from '@nestjs/testing';
import { PollController } from './poll.controller';
import { PollMongoService } from './poll.mongo.service';
import { SseService } from '../sse/sse.service';
import { PollCreateDto } from './poll.dtos';
import constants from '../common/constants';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

describe('Test PollController', () => {

    const testObjectId = '999a8681e47db28bf0000222';
    const testPoll = {
        title: 'string',
        channel_id: '12345678901234567',
        poll_options:  [
            {
                _id: '123',
                poll_option_name: 'option1',
                poll_option_emoji: ':)',
            },
        ],
        allow_options_for_anyone: true,
        single_vote: true,
        end_time: new Date (Date.now() + (1000 * 60 * 60 * 24 * 3)),
        description: 'string',
        role_restrictions: [
            'string', 'string',
        ],
        author_user_id: '623a8681e47db28bf073366d',
    };

    let pollController: PollController;
    let mockSseService: any;
    beforeEach(async () => {

        class PollMongoServiceMock {
            fetchAllPolls() { return true; }
            createPoll(pollCreateDto: PollCreateDto) { return pollCreateDto; }
            fetchPollById(id) { return id; }
            updatePoll(id, poll) { return poll; }
            // eslint-disable-next-line
            deletePoll(id) { return testPoll; }
            fetchPollByUser(user_id) { return user_id; }
            fetchPollByUserOngoing(user_id) { return user_id; }
        }

        // Mock mongo service response
        const MongoFake = {
            provide: PollMongoService,
            useClass: PollMongoServiceMock,
        };

        mockSseService = {
            emit: jest.fn().mockImplementation(message => {
                return { message: message };
            }),
        };

        const SseFake = {
            provide: SseService,
            useValue: mockSseService,
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PollController],
            providers: [MongoFake, SseFake],
        }).compile();

        pollController = moduleFixture.get<PollController>(PollController);
    });

    it('checks if controller invokes PollMongoService', async () => {

        expect(await pollController.fetchAllPolls()).toBe(true);
        expect(await pollController.createPoll(testPoll)).toEqual(testPoll);
        expect(await pollController.fetchPollById(testObjectId)).toEqual(testObjectId);
        expect(await pollController.updatePoll(testObjectId, testPoll)).toEqual(testPoll);
        expect(await pollController.deletePoll(testObjectId)).toEqual(testPoll);
        expect(await pollController.fetchPollByUser(testObjectId)).toEqual(testObjectId);
        expect(await pollController.fetchPollByUserOngoing(testObjectId)).toEqual(testObjectId);
    });

    it('checks if createPoll invokes SSE correctly', async () => {

        await pollController.createPoll(testPoll);

        expect(mockSseService.emit).toHaveBeenCalledWith({ data: testPoll, type: constants.EVENT_POLL_CREATE });
        expect(await mockSseService.emit).toHaveBeenCalled();
    });

    it('checks if updatePoll invokes SSE correctly', async () => {

        await pollController.updatePoll(testObjectId, testPoll);

        expect(mockSseService.emit).toHaveBeenCalledWith({ data: testPoll, type: constants.EVENT_POLL_UPDATE });
        expect(await mockSseService.emit).toHaveBeenCalled();
    });

    it('checks if deletePoll invokes SSE correctly', async () => {

        await pollController.deletePoll(testObjectId);

        expect(mockSseService.emit).toHaveBeenCalledWith({ data: testPoll, type: constants.EVENT_POLL_DELETE });
        expect(await mockSseService.emit).toHaveBeenCalled();
    });
});

describe('Validation Unit Tests - test DTO against nestjs validation pipeline', () => {

    it('tests validation pipeline - using PollCreateDto', async () => {
        const testPoll = {
            title: 'string',
            channel_id: '12345678901234567',
            poll_options: {},
            allow_options_for_anyone: true,
            single_vote: true,
            end_time: new Date (Date.now() + (1000 * 60 * 60 * 24 * 3)),
            description: 'string',
            role_restrictions: [
                'string', 'string',
            ],
            author_user_id: '623a8681e47db28bf073366d',
        };

        const testPollWrongChannelId = {
            title: 'string',
            channel_id: 'string',
            poll_options: {},
            allow_options_for_anyone: true,
            single_vote: true,
            end_time: new Date(Date.now() + (1000 * 60 * 60 * 24 * 3)),
            description: 'string',
            role_restrictions: [
                'string', 'string',
            ],
            author_user_id: '623a8681e47db28bf073366d',
        };

        const testPollWrongMaxDate = {
            title: 'string',
            channel_id: '12345678901234567',
            poll_options: {},
            allow_options_for_anyone: true,
            single_vote: true,
            end_time: new Date (Date.now() + (1000 * 60 * 60 * 24 * 400)),
            description: 'string',
            role_restrictions: [
                'string', 'string',
            ],
            author_user_id: '623a8681e47db28bf073366d',
        };

        const testPollWrongMinDate = {
            title: 'string',
            channel_id: '12345678901234567',
            poll_options: {},
            allow_options_for_anyone: true,
            single_vote: true,
            end_time: new Date (Date.now()),
            description: 'string',
            role_restrictions: [
                'string', 'string',
            ],
            author_user_id: '623a8681e47db28bf073366d',
        };

        const testPollWrongAuthorId = {
            title: 'string',
            channel_id: '12345678901234567',
            poll_options: {},
            allow_options_for_anyone: true,
            single_vote: true,
            end_time: new Date (Date.now() + (1000 * 60 * 60 * 24 * 3)),
            description: 'string',
            role_restrictions: [
                'string', 'string',
            ],
            author_user_id: '12418749382342333',
        };


        const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: PollCreateDto,
            data: '',
        };

        // valid
        await expect(target.transform(testPoll, metadata)).resolves.toEqual(testPoll);

        // violates channel id constraint
        await expect(target.transform(testPollWrongChannelId, metadata)).rejects.toThrowError();

        // violates max date constraint
        await expect(target.transform(testPollWrongMaxDate, metadata)).rejects.toThrowError();

        // violates min date constraint
        await expect(target.transform(testPollWrongMinDate, metadata)).rejects.toThrowError();

        // violates author ID constraint
        await expect(target.transform(testPollWrongAuthorId, metadata)).rejects.toThrowError();

    });
});