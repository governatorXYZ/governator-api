import { Test, TestingModule } from '@nestjs/testing';
import { PollMongoService } from './poll.mongo.service';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { Model, Query } from 'mongoose';
import { Poll, PollDocument } from './poll.schema';
import { PollResponseDto } from './poll.dtos';
import { HttpException, HttpStatus } from '@nestjs/common';

const date = new Date (Date.now() + (1000 * 60 * 60 * 24 * 3));

const mockPoll = (
    _id = '623a8681e47db28bf073366d',
    title = 'string',
    channel_id = '12345678901234567',
    poll_options = [
        {
            _id: '123',
            poll_option_name: 'option1',
            poll_option_emoji: ':)',
        },
    ],
    allow_options_for_anyone = true,
    single_vote = true,
    end_time = date,
    description = 'string',
    role_restrictions = [
        'string', 'string',
    ],
    author_user_id = '623a8681e47db28bf073366d',
): PollResponseDto => <PollResponseDto>({
    _id,
    title,
    channel_id,
    poll_options,
    allow_options_for_anyone,
    single_vote,
    end_time,
    description,
    role_restrictions,
    author_user_id,
});

const mockPollDoc = (mock?: Partial<Poll>): Partial<PollDocument> => ({
    _id: mock?._id || '623a8681e47db28bf073366d',
    title: mock?.title || 'string',
    channel_id: mock?.channel_id || '12345678901234567',
    poll_options: mock?.poll_options || [
        {
            _id: '123',
            poll_option_name: 'option1',
            poll_option_emoji: ':)',
        },
    ],
    allow_options_for_anyone: mock?.allow_options_for_anyone || true,
    single_vote: mock?.single_vote || true,
    end_time: mock?.end_time || date,
    description: mock?.description || 'string',
    role_restrictions: mock?.role_restrictions || [
        'string', 'string',
    ],
    author_user_id: mock?.author_user_id || '623a8681e47db28bf073366d',

});

const pollArray = [
    mockPoll(),
    mockPoll('111a8681e4734rtg5678366d',
        'title 2',
        '32434243324324',
        [
            {
                _id: '123',
                poll_option_name: 'option1',
                poll_option_emoji: ':)',
            },
        ],
        true,
        true,
        date,
        'descroption',
        ['no', 'restrictions'],
        '111a8681e47db28bf0733111'),
    mockPoll('222a8681e4734rtg56783222',
        'title 3',
        '11111111111',
        [
            {
                _id: '123',
                poll_option_name: 'option1',
                poll_option_emoji: ':)',
            },
        ],
        true,
        true,
        date,
        'description 3',
        ['all', 'restrictions'],
        '222a8681e47db28bf0733111'),
];

const pollDocArray = [
    mockPollDoc(),
    mockPollDoc({
        _id: '111a8681e4734rtg5678366d',
        title: 'title 2',
        channel_id: '32434243324324',
        poll_options:  [
            {
                _id: '123',
                poll_option_name: 'option1',
                poll_option_emoji: ':)',
            },
        ],
        allow_options_for_anyone: false,
        single_vote: true,
        end_time: date,
        description: 'descroption',
        role_restrictions: ['no', 'restrictions'],
        author_user_id: '111a8681e47db28bf0733111' }),
    mockPollDoc({
        _id: '222a8681e4734rtg56783222',
        title: 'title 3',
        channel_id: '11111111111',
        poll_options:  [
            {
                _id: '123',
                poll_option_name: 'option1',
                poll_option_emoji: ':)',
            },
        ],
        allow_options_for_anyone: false,
        single_vote: true,
        end_time: date,
        description: 'description 3',
        role_restrictions: ['all', 'restrictions'],
        author_user_id: '222a8681e47db28bf0733111' }),
];

describe('PollMongoService test series', () => {
    let service: PollMongoService;
    let model: Model<PollDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PollMongoService,
                {
                    provide: getModelToken('Poll'),
                    // notice that only the functions we call from the model are mocked
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockPoll()),
                        constructor: jest.fn().mockResolvedValue(mockPoll()),
                        create: jest.fn(),
                        find: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PollMongoService>(PollMongoService);
        model = module.get<Model<PollDocument>>(getModelToken('Poll'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new poll', async () => {
        jest.spyOn(model, 'create').mockImplementationOnce(() =>
            Promise.resolve({
                _id: '623a8681e47db28bf073366d',
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
                end_time: date,
                single_vote: true,
                description: 'string',
                role_restrictions: ['string', 'string'],
                author_user_id: '623a8681e47db28bf073366d',
            }),
        );
        const newPoll = await service.createPoll({
            // _id: '623a8681e47db28bf073366d',
            title: 'string',
            channel_id: '12345678901234567',
            poll_options: [
                {
                    _id: '123',
                    poll_option_name: 'option1',
                    poll_option_emoji: ':)',
                },
            ],
            allow_options_for_anyone: true,
            end_time: date,
            single_vote: true,
            description: 'string',
            role_restrictions: ['string', 'string'],
            author_user_id: '623a8681e47db28bf073366d',
        });
        expect(newPoll).toEqual(mockPoll());
    });

    // TODO: add test for error pathway

    it('should return all polls', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(pollDocArray),
        } as any);
        const polls = await service.fetchAllPolls();
        expect(polls).toEqual(pollArray);
    });

    it('fetchAllPolls() should return correct error type and message', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchAllPolls()).rejects.toThrow(HttpException);
        await expect(service.fetchAllPolls()).rejects.toEqual(new HttpException('Failed to fetch polls from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch a poll by id', async () => {
        jest.spyOn(model, 'findById').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(mockPollDoc({ title: 'test', _id: '623a8681e47db28bf073366d' })),
            }) as any,
        );
        const findMockPoll = mockPoll('623a8681e47db28bf073366d', 'test');
        const foundPoll = await service.fetchPollById('623a8681e47db28bf073366d');
        expect(foundPoll).toEqual(findMockPoll);
    });

    it('fetchPollById() should return correct error type and message', async () => {
        jest.spyOn(model, 'findById').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchPollById('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.fetchPollById('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch a poll by user', async () => {
        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockPollDoc(),
                    ),
            }) as any,
        );
        const findMockPoll = mockPoll();
        const foundPoll = await service.fetchPollByUser('623a8681e47db28bf073366d');
        expect(foundPoll).toEqual(findMockPoll);
    });

    it('fetchPollByUser() should return correct error type and message', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchPollByUser('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.fetchPollByUser('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch an active poll by user', async () => {
        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockPollDoc(),
                    ),
            }) as any,
        );
        const findMockPoll = mockPoll();
        const foundPoll = await service.fetchPollByUserOngoing('623a8681e47db28bf073366d');
        expect(foundPoll).toEqual(findMockPoll);
    });

    it('fetchPollByUserOngoing() should return correct error type and message', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchPollByUserOngoing('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.fetchPollByUserOngoing('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
    });

    it('should update a poll successfully', async () => {
        jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce({
                    _id: '623a8681e47db28bf073366d',
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
                    end_time: date,
                    single_vote: true,
                    description: 'string',
                    role_restrictions: ['string', 'string'],
                    author_user_id: '623a8681e47db28bf073366d',
                }),
            }) as any,
        );
        const updatedPoll = await service.updatePoll('623a8681e47db28bf073366d', {
            _id: '623a8681e47db28bf073366d',
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
            end_time: date,
            single_vote: true,
            description: 'string',
            role_restrictions: ['string', 'string'],
            author_user_id: '623a8681e47db28bf073366d',
        });
        expect(updatedPoll).toEqual(mockPoll());
    });

    it(' updatePoll() should error correctly', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updatePoll('a bad value')).rejects.toThrow(HttpException);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updatePoll('a bad value')).rejects.toEqual(new HttpException('Failed to update poll in db', HttpStatus.BAD_REQUEST));
    });

    it('should delete a poll successfully', async () => {
        jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce({
                    _id: '623a8681e47db28bf073366d',
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
                    end_time: date,
                    single_vote: true,
                    description: 'string',
                    role_restrictions: ['string', 'string'],
                    author_user_id: '623a8681e47db28bf073366d',
                }),
            }) as any,
        );
        expect(await service.deletePoll('623a8681e47db28bf073366d')).toEqual(mockPoll());
    });

    it('should not delete a poll and error correctly', async () => {
        await expect(service.deletePoll('a bad id')).rejects.toThrow(HttpException);
        await expect(service.deletePoll('a bad id')).rejects.toEqual(new HttpException('Failed to delete poll from db', HttpStatus.BAD_REQUEST));

    });

});