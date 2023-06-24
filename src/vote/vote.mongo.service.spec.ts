import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { UserResponseDto } from '../user/user.dtos';
import { AccountCreateDto } from '../account/account.dtos';
import { VoteMongoService } from '../vote/vote.mongo.service';
import { Vote, VoteDocument } from '../vote/vote.schema';
import { PollDocument } from '../poll/poll.schema';
import { UserCreateDto, UserUpdateDto } from '../user/user.dtos';
import { PollCreateDto, PollResponseDto } from '../poll/poll.dtos';
import { PollMongoService } from '../poll/poll.mongo.service';
import { VoteRawResponseDto } from '../vote/vote.dtos';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';


const mockVote = (
    user_id = '623a8681e47db28bf073366d',
    poll_id = '623a8681e47db28bf07399',
    poll_option_id = 'A',
): VoteRawResponseDto => <VoteRawResponseDto>({
    user_id: user_id,
    poll_id: poll_id,
    poll_option_id: poll_option_id,
});

const mockVoteDoc = (mock?: Partial<Vote>): Partial<VoteDocument> => ({
    user_id: mock?._id || '623a8681e47db28bf073366d',
    poll_id: mock?.poll_id || '623a8681e47db28bf07399',
    poll_option_id: mock?.poll_option_id || 'A',
});


// const voteArray = [
//     mockVote(),
//     mockVote('111a8681e4734rtg56783222',
//         '222a8681e4734rtg56783222',
//         'B',
//     ),
//     mockVote('222a8681e4734rtg56783333',
//         '333a8681e4734rtg56783222',
//         'C',
//     ),
// ];

// const voteDocArray = [
//     mockVoteDoc(),
//     mockVoteDoc({
//         user_id: '111a8681e4734rtg56783222',
//         poll_id: '222a8681e4734rtg56783222',
//         poll_option_id: 'B',
//     }),
//     mockVoteDoc({
//         user_id: '222a8681e4734rtg56783333',
//         poll_id: '333a8681e4734rtg56783222',
//         poll_option_id: 'C',
//     }),
// ];

const mockUser = (
    _id = '623a8681e47db28bf073366d',
    name = 'Tiki',
    image = 'some/image',
    email = 'some@email.com',
    emailVerified = false,
): UserResponseDto => <UserResponseDto>({
    _id: _id,
    name: name,
    image: image,
    email: email,
    emailVerified: emailVerified,
});

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

describe('VoteMongoService test series', () => {
    let service: VoteMongoService;
    let model: Model<VoteDocument>;
    let pollModel: Model<PollDocument>;
    let userModel: Model<UserDocument>;


    beforeEach(async () => {

        class PollMongoServiceMock {
            fetchAllPolls() { return true; }
            createPoll(pollCreateDto: PollCreateDto) { return pollCreateDto; }
            fetchPollById(id) { return id; }
            updatePoll(id, poll) { return poll; }
            // eslint-disable-next-line
            deletePoll(id) { return true; }
            fetchPollByUser(user_id) { return user_id; }
            fetchPollByUserOngoing(user_id) { return user_id; }
        }

        class UserMongoServiceMock {
            fetchAllUsers() { return true; }
            createUser(userCreateDto: UserCreateDto) { return userCreateDto; }
            fetchUserById(id) { return id; }
            updateUser(id, user: UserUpdateDto) { return user; }
            // eslint-disable-next-line
            deleteUser(id) { return true; }
            // eslint-disable-next-line
            fetchUserByProvider(provider_id, provider_account_id) { return true; }
            addProviderAccount(account: AccountCreateDto) { return account; }
            removeProviderAccount(id, account: AccountCreateDto) { return account; }
        }

        // Mock mongo service response
        const PollMongoFake = {
            provide: PollMongoService,
            useClass: PollMongoServiceMock,
        };
        const UserMongoFake = {
            provide: UserMongoService,
            useClass: UserMongoServiceMock,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PollMongoFake,
                {
                    provide: getModelToken('Poll'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockPoll()),
                        constructor: jest.fn().mockResolvedValue(mockPoll()),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                    },
                },
                UserMongoFake,
                {
                    provide: getModelToken('User'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockUser()),
                        constructor: jest.fn().mockResolvedValue(mockUser()),
                        create: jest.fn(),
                        find: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                    },
                },
                VoteMongoService,
                {
                    provide: getModelToken('Vote'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockVote()),
                        constructor: jest.fn().mockResolvedValue(mockVote()),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        aggregate: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<VoteMongoService>(VoteMongoService);
        model = module.get<Model<VoteDocument>>(getModelToken('Vote'));
        pollModel = module.get<Model<PollDocument>>(getModelToken('Poll'));
        userModel = module.get<Model<UserDocument>>(getModelToken('User'));

    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new vote', async () => {
        jest.spyOn(model, 'create').mockImplementationOnce(() =>
            Promise.resolve(mockVote()),
        );
        const newVote = await service.createVote({
            user_id: '623a8681e47db28bf073366d',
            poll_id: '623a8681e47db28bf07399',
            poll_option_id: 'A',
        });
        expect(newVote).toEqual(service.transformResult('create', (mockVote())));
    });

    // TODO: get error pathway to work

    it('should return vote aggregate', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce({ poll_option_id: 'A', count: 2 }),
        } as any);
        const result = await service.fetchVoteByPoll('123');
        expect(result).toEqual({ poll_option_id: 'A', count: 2 });
    });

    it('fetchVoteByPoll() should return correct error type and message', async () => {
        jest.spyOn(model, 'aggregate').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchVoteByPoll('123')).rejects.toThrow(HttpException);
        await expect(service.fetchVoteByPoll('123')).rejects.toEqual(new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST));
    });

    it('should return vote aggregate', async () => {
        jest.spyOn(model, 'aggregate').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce({ poll_option_id: 'A', count: 2 }),
        } as any);
        const result = await service.fetchVoteByPollAggregate('123');
        expect(result).toEqual({ poll_option_id: 'A', count: 2 });
    });

    it('fetchVoteByPoll() should return correct error type and message', async () => {
        jest.spyOn(model, 'aggregate').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchVoteByPollAggregate('123')).rejects.toThrow(HttpException);
        await expect(service.fetchVoteByPollAggregate('123')).rejects.toEqual(new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST));
    });

    it('should return aggregate', async () => {
        jest.spyOn(model, 'aggregate').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(mockVoteDoc()),
            }) as any,
        );
        const findMockVote = mockVote('623a8681e47db28bf073366d', '623a8681e47db28bf07399', 'A');
        const foundVote = await service.fetchVoteByPollAndUserAggregate('623a8681e47db28bf07399', '623a8681e47db28bf073366d');
        expect(foundVote).toEqual(findMockVote);
    });

    it('fetchVoteByPollAndUser() should return correct error type and message', async () => {
        jest.spyOn(model, 'aggregate').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchVoteByPollAndUserAggregate('623a8681e47db28bf07399', '623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.fetchVoteByPollAndUserAggregate('623a8681e47db28bf07399', '623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch all votes of a user', async () => {
        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockVoteDoc(),
                    ),
            }) as any,
        );

        const findMockVote = mockVote();
        const foundVote = await service.getVotes('623a8681e47db28bf07399', '623a8681e47db28bf073366d');
        expect(foundVote).toEqual(findMockVote);
    });

    it('getVotes() should return correct error type and message', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.getVotes('623a8681e47db28bf07399', '623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.getVotes('623a8681e47db28bf07399', '623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST));
    });

    it('should update a user successfully', async () => {
        jest.spyOn(model, 'findOne').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(
                    mockVoteDoc(),
                ),
            }) as any,
        );

        jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(
                    mockVoteDoc(),
                ),
            }) as any,
        );

        const updatedVote = await service.updateVote(mockVote());
        expect(updatedVote).toEqual(service.transformResult('update', { oldVote: mockVote(), updatedVote: mockVote() }));
    });

    it(' updateVote() should error correctly', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updateVote('a bad id', mockUser())).rejects.toThrow(HttpException);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updateVote('a bad id', mockUser())).rejects.toEqual(new HttpException('Failed to update db', HttpStatus.BAD_REQUEST));
    });

    it('should delete a vote successfully', async () => {
        jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockVote()),
            }) as any,
        );
        expect(await service.deleteVote(mockVote())).toEqual(service.transformResult('delete', mockVote()));
    });

    it('should not delete a user and error correctly', async () => {
        // eslint-disable-next-line
        // @ts-ignore
        await expect(service.deleteVote('a bad id')).rejects.toThrow(HttpException);
        // eslint-disable-next-line
        // @ts-ignore
        await expect(service.deleteVote('a bad id')).rejects.toEqual(new HttpException('Failed to delete from db', HttpStatus.BAD_REQUEST));

    });

    it('should get a poll', async () => {
        jest.spyOn(pollModel, 'findById').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockPoll()),
            }) as any,
        );
        const findMockPoll = mockPoll();
        const foundPoll = await service.getPoll('623a8681e47db28bf07399');
        expect(foundPoll).toEqual(findMockPoll);
    });

    it('should get a user', async () => {
        jest.spyOn(userModel, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockUser()),
            }) as any,
        );
        const findMockUser = mockUser();
        const foundUser = await service.getUser('623a8681e47db28bf07399');
        expect(foundUser).toEqual(findMockUser);
    });

    it('should validate the request and creeate a new vote but not update or delete', async () => {
        jest.spyOn(userModel, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockUser()),
            }) as any,
        );

        jest.spyOn(pollModel, 'findById').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockPoll()),
            }) as any,
        );

        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce([]),
            }) as any,
        );

        jest.spyOn(model, 'create').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce('created!'),
            }) as any,
        );

        const updateSpy = jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        const deleteSpy = jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        const validatedVote = await service.validateVoteRequest('623a8681e47db28bf07399', mockVote());
        // eslint-disable-next-line
        // @ts-ignore
        expect(validatedVote).toEqual(service.transformResult('create', 'created!'));

        expect(updateSpy).not.toHaveBeenCalled();
        expect(deleteSpy).not.toHaveBeenCalled();

    });

    it('should validate the request and update but not create or delete', async () => {
        jest.spyOn(userModel, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockUser()),
            }) as any,
        );

        jest.spyOn(service, 'isDuplicateVote').mockImplementation(() => false);


        jest.spyOn(pollModel, 'findById').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockPoll()),
            }) as any,
        );

        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockVote()),
            }) as any,
        );

        const createSpy = jest.spyOn(model, 'create').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        jest.spyOn(model, 'findOne').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce('updated!'),
            }) as any,
        );

        jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce('updated!'),
            }) as any,
        );

        const deleteSpy = jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        const validatedVote = await service.validateVoteRequest('623a8681e47db28bf07399', mockVote());
        // eslint-disable-next-line
        // @ts-ignore
        expect(validatedVote).toEqual(service.transformResult('update', { oldVote: 'updated!', updatedVote: 'updated!' }));

        expect(createSpy).not.toHaveBeenCalled();
        expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should validate the request and delete but not create or update', async () => {
        jest.spyOn(userModel, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockUser()),
            }) as any,
        );

        jest.spyOn(service, 'isDuplicateVote').mockImplementation(() => true);


        jest.spyOn(pollModel, 'findById').mockReturnValueOnce(
            createMock<Query<PollDocument, PollDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockPoll()),
            }) as any,
        );

        jest.spyOn(model, 'find').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(mockVote()),
            }) as any,
        );

        const createSpy = jest.spyOn(model, 'create').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        jest.spyOn(model, 'findOne').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce('updated!'),
            }) as any,
        );

        const updateSpy = jest.spyOn(model, 'findOneAndUpdate').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce(false),
            }) as any,
        );

        jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<VoteDocument, VoteDocument>>({
                exec: jest.fn().mockResolvedValueOnce('deleted!'),
            }) as any,
        );

        const validatedVote = await service.validateVoteRequest('623a8681e47db28bf07399', mockVote());
        // eslint-disable-next-line
        // @ts-ignore
        expect(validatedVote).toEqual(service.transformResult('delete', 'deleted!'));

        expect(createSpy).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
    });
});