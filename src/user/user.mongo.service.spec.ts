// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { UserResponseDto } from './user.dtos';
// import { UserMongoService } from './user.mongo.service';
// import { User, UserDocument } from './user.schema';
// import {AccountModule} from "../account/account.module";
//
// const mockUser = (
//     _id = '623a8681e47db28bf073366d',
//     name = 'Tiki',
//     image = 'some/image',
//     email = 'some@email.com',
//     emailVerified = false,
// ): UserResponseDto => <UserResponseDto>({
//     _id: _id,
//     name: name,
//     image: image,
//     email: email,
//     emailVerified: emailVerified,
// });
//
// const mockUserDoc = (mock?: Partial<User>): Partial<UserDocument> => ({
//     _id: mock?._id || '623a8681e47db28bf073366d',
//     name: mock?.name || 'Tiki',
//     image: mock?.image || 'some/image',
//     email: mock?.email || 'some@email.com',
//     emailVerified: mock?.emailVerified || false,
//
// });
//
// const userArray = [
//     mockUser(),
//     mockUser('111a8681e4734rtg5678366d',
//         'naame',
//         '/some/pfp',
//         'e@mail.com',
//         false,
//     ),
//     mockUser('222a8681e4734rtg56783222',
//         'title 3',
//         '/some/pfp',
//         'eeeee@mail.com',
//         true,
//     ),
// ];
//
// const userDocArray = [
//     mockUserDoc(),
//     mockUserDoc({
//         _id: '111a8681e4734rtg5678366d',
//         name: 'naame',
//         image: '/some/pfp',
//         email: 'e@mail.com',
//         emailVerified: false,
//     }),
//     mockUserDoc({
//         _id: '222a8681e4734rtg56783222',
//         name: 'title 3',
//         image: '/some/pfp',
//         email: 'eeeee@mail.com',
//         emailVerified: true,
//     }),
// ];
//
// describe('UserMongoService test series', () => {
//     let service: UserMongoService;
//     let model: Model<UserDocument>;
//
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [AccountModule],
//             providers: [
//                 UserMongoService,
//                 {
//                     provide: getModelToken('User'),
//                     // notice that only the functions we call from the model are mocked
//                     useValue: {
//                         new: jest.fn().mockResolvedValue(mockUser()),
//                         constructor: jest.fn().mockResolvedValue(mockUser()),
//                         create: jest.fn(),
//                         find: jest.fn(),
//                         findById: jest.fn(),
//                         findByIdAndUpdate: jest.fn(),
//                         findOneAndDelete: jest.fn(),
//                     },
//                 },
//                 // {provide: getModelToken('Account'),},
//             ],
//         }).compile();
//
//         service = module.get<UserMongoService>(UserMongoService);
//         model = module.get<Model<UserDocument>>(getModelToken('User'));
//     });
//
//     it('should be defined', () => {
//         expect(service).toBeDefined();
//     });
//
//     afterEach(() => {
//         jest.clearAllMocks();
//     });
//
//     it('should create a new user', async () => {
//         jest.spyOn(model, 'create').mockImplementationOnce(() =>
//             Promise.resolve(mockUser()),
//         );
//         const newUser = await service.createUser({
//             name: 'string',
//             image: 'my/cool/image',
//             email: 'hello@test.com',
//             emailVerified: true,
//         });
//         expect(newUser).toEqual(mockUser());
//     });
//
//     // // TODO: add test for error pathway
//     //
//     // it('should return all polls', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValue({
//     //         exec: jest.fn().mockResolvedValueOnce(pollDocArray),
//     //     } as any);
//     //     const polls = await service.fetchAllPolls();
//     //     expect(polls).toEqual(pollArray);
//     // });
//     //
//     // it('fetchAllPolls() should return correct error type and message', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValue({
//     //         exec: jest.fn().mockImplementation(() => {
//     //             throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
//     //         }),
//     //     } as any);
//     //     await expect(service.fetchAllPolls()).rejects.toThrow(HttpException);
//     //     await expect(service.fetchAllPolls()).rejects.toEqual(new HttpException('Failed to fetch polls from db', HttpStatus.BAD_REQUEST));
//     // });
//     //
//     // it('should fetch a poll by id', async () => {
//     //     jest.spyOn(model, 'findById').mockReturnValueOnce(
//     //         createMock<Query<PollDocument, PollDocument>>({
//     //             exec: jest
//     //                 .fn()
//     //                 .mockResolvedValueOnce(mockPollDoc({ title: 'test', _id: '623a8681e47db28bf073366d' })),
//     //         }) as any,
//     //     );
//     //     const findMockPoll = mockPoll('623a8681e47db28bf073366d', 'test');
//     //     const foundPoll = await service.fetchPollById('623a8681e47db28bf073366d');
//     //     expect(foundPoll).toEqual(findMockPoll);
//     // });
//     //
//     // it('fetchPollById() should return correct error type and message', async () => {
//     //     jest.spyOn(model, 'findById').mockReturnValue({
//     //         exec: jest.fn().mockImplementation(() => {
//     //             throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
//     //         }),
//     //     } as any);
//     //     await expect(service.fetchPollById('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
//     //     await expect(service.fetchPollById('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
//     // });
//     //
//     // it('should fetch a poll by user', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValueOnce(
//     //         createMock<Query<PollDocument, PollDocument>>({
//     //             exec: jest
//     //                 .fn()
//     //                 .mockResolvedValueOnce(
//     //                     mockPollDoc(),
//     //                 ),
//     //         }) as any,
//     //     );
//     //     const findMockPoll = mockPoll();
//     //     const foundPoll = await service.fetchPollByUser('623a8681e47db28bf073366d');
//     //     expect(foundPoll).toEqual(findMockPoll);
//     // });
//     //
//     // it('fetchPollByUser() should return correct error type and message', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValue({
//     //         exec: jest.fn().mockImplementation(() => {
//     //             throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
//     //         }),
//     //     } as any);
//     //     await expect(service.fetchPollByUser('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
//     //     await expect(service.fetchPollByUser('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
//     // });
//     //
//     // it('should fetch an active poll by user', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValueOnce(
//     //         createMock<Query<PollDocument, PollDocument>>({
//     //             exec: jest
//     //                 .fn()
//     //                 .mockResolvedValueOnce(
//     //                     mockPollDoc(),
//     //                 ),
//     //         }) as any,
//     //     );
//     //     const findMockPoll = mockPoll();
//     //     const foundPoll = await service.fetchPollByUserOngoing('623a8681e47db28bf073366d');
//     //     expect(foundPoll).toEqual(findMockPoll);
//     // });
//     //
//     // it('fetchPollByUserOngoing() should return correct error type and message', async () => {
//     //     jest.spyOn(model, 'find').mockReturnValue({
//     //         exec: jest.fn().mockImplementation(() => {
//     //             throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
//     //         }),
//     //     } as any);
//     //     await expect(service.fetchPollByUserOngoing('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
//     //     await expect(service.fetchPollByUserOngoing('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST));
//     // });
//     //
//     // it('should update a poll successfully', async () => {
//     //     jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(
//     //         createMock<Query<PollDocument, PollDocument>>({
//     //             exec: jest.fn().mockResolvedValueOnce({
//     //                 _id: '623a8681e47db28bf073366d',
//     //                 title: 'string',
//     //                 channel_id: '12345678901234567',
//     //                 poll_options: {},
//     //                 allow_options_for_anyone: true,
//     //                 end_time: date,
//     //                 single_vote: true,
//     //                 description: 'string',
//     //                 role_restrictions: ['string', 'string'],
//     //                 author_user_id: '623a8681e47db28bf073366d',
//     //             }),
//     //         }) as any,
//     //     );
//     //     const updatedPoll = await service.updatePoll('623a8681e47db28bf073366d', {
//     //         _id: '623a8681e47db28bf073366d',
//     //         title: 'string',
//     //         channel_id: '12345678901234567',
//     //         poll_options: {},
//     //         allow_options_for_anyone: true,
//     //         end_time: date,
//     //         single_vote: true,
//     //         description: 'string',
//     //         role_restrictions: ['string', 'string'],
//     //         author_user_id: '623a8681e47db28bf073366d',
//     //     });
//     //     expect(updatedPoll).toEqual(mockPoll());
//     // });
//     //
//     // it(' updatePoll() should error correctly', async () => {
//     //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     //     // @ts-ignore
//     //     await expect(service.updatePoll('a bad value')).rejects.toThrow(HttpException);
//     //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     //     // @ts-ignore
//     //     await expect(service.updatePoll('a bad value')).rejects.toEqual(new HttpException('Failed to update poll in db', HttpStatus.BAD_REQUEST));
//     // });
//     //
//     // it('should delete a poll successfully', async () => {
//     //     jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
//     //         createMock<Query<PollDocument, PollDocument>>({
//     //             exec: jest.fn().mockResolvedValueOnce({
//     //                 _id: '623a8681e47db28bf073366d',
//     //                 title: 'string',
//     //                 channel_id: '12345678901234567',
//     //                 poll_options: {},
//     //                 allow_options_for_anyone: true,
//     //                 end_time: date,
//     //                 single_vote: true,
//     //                 description: 'string',
//     //                 role_restrictions: ['string', 'string'],
//     //                 author_user_id: '623a8681e47db28bf073366d',
//     //             }),
//     //         }) as any,
//     //     );
//     //     expect(await service.deletePoll('623a8681e47db28bf073366d')).toEqual(mockPoll());
//     // });
//     //
//     // it('should not delete a poll and error correctly', async () => {
//     //     await expect(service.deletePoll('a bad id')).rejects.toThrow(HttpException);
//     //     await expect(service.deletePoll('a bad id')).rejects.toEqual(new HttpException('Failed to delete poll from db', HttpStatus.BAD_REQUEST));
//     //
//     // });
//
// });