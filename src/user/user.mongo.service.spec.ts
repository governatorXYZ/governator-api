import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { UserResponseDto } from './user.dtos';
import { UserMongoService } from './user.mongo.service';
import { User, UserDocument } from './user.schema';
import { AccountMongoService } from '../account/account.mongo.service';
import { AccountCreateDto } from '../account/account.dtos';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Account, AccountDocument } from '../account/account.schema';


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

const mockUserDoc = (mock?: Partial<User>): Partial<UserDocument> => ({
    _id: mock?._id || '623a8681e47db28bf073366d',
    name: mock?.name || 'Tiki',
    image: mock?.image || 'some/image',
    email: mock?.email || 'some@email.com',
    emailVerified: mock?.emailVerified || false,

});

const mockAccountDoc = (mock?: Partial<Account>): Partial<AccountDocument> => ({
    _id: mock?._id || '222a8681e4734rtg56783333',
    provider_id: mock?.provider_id || 'discord',
    provider_account_id: mock?.provider_account_id || '1234',
    user_id: mock?.user_id || '111a8681e4734rtg5678366d',
});

const userArray = [
    mockUser(),
    mockUser('111a8681e4734rtg5678366d',
        'naame',
        '/some/pfp',
        'e@mail.com',
        false,
    ),
    mockUser('222a8681e4734rtg56783222',
        'title 3',
        '/some/pfp',
        'eeeee@mail.com',
        true,
    ),
];

const userDocArray = [
    mockUserDoc(),
    mockUserDoc({
        _id: '111a8681e4734rtg5678366d',
        name: 'naame',
        image: '/some/pfp',
        email: 'e@mail.com',
        emailVerified: false,
    }),
    mockUserDoc({
        _id: '222a8681e4734rtg56783222',
        name: 'title 3',
        image: '/some/pfp',
        email: 'eeeee@mail.com',
        emailVerified: true,
    }),
];

const mockAccount = (user_id = '111a8681e4734rtg5678366d', provider_id = 'discord', provider_account_id = '1234') => {
    return {
        _id: '222a8681e4734rtg56783333',
        user_id: user_id,
        provider_id: provider_id,
        provider_account_id: provider_account_id,
    };
};

describe('UserMongoService test series', () => {
    let service: UserMongoService;
    let model: Model<UserDocument>;
    let accountModel: Model<AccountDocument>;

    beforeEach(async () => {

        class AccountMongoServiceMock {
            createAccount(accountCreateDto: AccountCreateDto) {
                return mockAccount(
                    accountCreateDto.user_id,
                    accountCreateDto.provider_id,
                    accountCreateDto.provider_account_id,
                );
            }
        }

        // Mock mongo service response
        const AccountMongoFake = {
            provide: AccountMongoService,
            useClass: AccountMongoServiceMock,
        };

        const module: TestingModule = await Test.createTestingModule({
            // imports: [AccountModule],
            providers: [
                AccountMongoFake,
                {
                    provide: getModelToken('Account'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockAccount()),
                        constructor: jest.fn().mockResolvedValue(mockAccount()),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                    },
                },
                UserMongoService,
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
            ],
        }).compile();

        service = module.get<UserMongoService>(UserMongoService);
        model = module.get<Model<UserDocument>>(getModelToken('User'));
        accountModel = module.get<Model<AccountDocument>>(getModelToken('Account'));

    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new user', async () => {
        jest.spyOn(model, 'create').mockImplementationOnce(() =>
            Promise.resolve(mockUser()),
        );
        const newUser = await service.createUser({
            name: 'string',
            image: 'my/cool/image',
            email: 'hello@test.com',
            emailVerified: true,
        });
        expect(newUser).toEqual(mockUser());
    });

    // TODO: get error pathway to work

    // it('createUser() should return correct error type and message', async () => {
    //     jest.spyOn(model, 'create').mockReturnValue({
    //         exec: jest.fn().mockImplementation(() => {
    //             throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
    //         }),
    //     } as any);
    //     await expect(service.createUser({
    //         name: 'string',
    //         image: 'my/cool/image',
    //         email: 'hello@test.com',
    //         emailVerified: true,
    //     })).rejects.toThrow(HttpException);
    //     await expect(service.createUser({
    //         name: 'string',
    //         image: 'my/cool/image',
    //         email: 'hello@test.com',
    //         emailVerified: true,
    //     })).rejects.toEqual(new HttpException('Failed to fetch users from db', HttpStatus.BAD_REQUEST));
    // });

    it('should return all users', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(userDocArray),
        } as any);
        const users = await service.fetchAllUsers();
        expect(users).toEqual(userArray);
    });

    it('fetchAllUsers() should return correct error type and message', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchAllUsers()).rejects.toThrow(HttpException);
        await expect(service.fetchAllUsers()).rejects.toEqual(new HttpException('Failed to fetch users from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch a user by id', async () => {
        jest.spyOn(model, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(mockUserDoc({
                        // _id: '623a8681e47db28bf073366d',
                        name: 'test',
                        image: 'some/image',
                        email: 'some@email.com',
                        emailVerified: false,
                    })),
            }) as any,
        );
        const findMockUser = mockUser('623a8681e47db28bf073366d', 'test');
        const foundUser = await service.fetchUserById('623a8681e47db28bf073366d');
        expect(foundUser).toEqual(findMockUser);
    });

    it('fetchUserById() should return correct error type and message', async () => {
        jest.spyOn(model, 'findById').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchUserById('623a8681e47db28bf073366d')).rejects.toThrow(HttpException);
        await expect(service.fetchUserById('623a8681e47db28bf073366d')).rejects.toEqual(new HttpException('Failed to fetch user from db', HttpStatus.BAD_REQUEST));
    });

    it('should fetch a user by provider', async () => {
        jest.spyOn(accountModel, 'findOne').mockReturnValueOnce(
            createMock<Query<AccountDocument, AccountDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockAccountDoc(),
                    ),
            }) as any,
        );

        jest.spyOn(model, 'findById').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockUserDoc(),
                    ),
            }) as any,
        );
        const findMockUser = mockUser();
        const foundUser = await service.fetchUserByProvider('discord', '12345');
        expect(foundUser).toEqual(findMockUser);
    });

    it('fetchUserByProvider() should return correct error type and message', async () => {
        jest.spyOn(model, 'findById').mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
                throw new HttpException('error testing', HttpStatus.BAD_REQUEST);
            }),
        } as any);
        await expect(service.fetchUserByProvider('discord', '1234')).rejects.toThrow(HttpException);
        await expect(service.fetchUserByProvider('discord', '1234')).rejects.toEqual(new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST));
    });

    it('should create a new account with user_id', async () => {
        jest.spyOn(accountModel, 'create').mockImplementationOnce(() =>
            Promise.resolve(mockAccount()),
        );
        const createdAccount = await service.addProviderAccount({
            user_id: '111a8681e4734rtg5678366d',
            provider_id: 'discord',
            provider_account_id: '1234',
        });
        expect(createdAccount).toEqual(mockAccount());
    });

    it('should delete an account with user_id', async () => {
        jest.spyOn(accountModel, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<AccountDocument, AccountDocument>>({
                exec: jest
                    .fn()
                    .mockResolvedValueOnce(
                        mockAccountDoc(),
                    ),
            }) as any,
        );
        const deletedAccount = await service.removeProviderAccount(
            '111a8681e4734rtg5678366d',
            'discord',
        );
        const deletedMockAccount = mockAccount();
        expect(deletedAccount).toEqual(deletedMockAccount);
    });

    it('should not delete an account and error correctly', async () => {
        await expect(service.removeProviderAccount('a bad id', 'discord')).rejects.toThrow(HttpException);
        await expect(service.removeProviderAccount('a bad id', 'discord')).rejects.toEqual(new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST));
    });

    it('should update a user successfully', async () => {
        jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce(
                    mockUserDoc(),
                ),
            }) as any,
        );
        const updatedUser = await service.updateUser('623a8681e47db28bf073366d', {
            name: 'Tiki',
            image: 'some/image',
            email: 'some@email.com',
            emailVerified: false,
        });
        expect(updatedUser).toEqual(mockUser());
    });

    it(' updateUser() should error correctly', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updateUser('a bad id', mockUser())).rejects.toThrow(HttpException);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await expect(service.updateUser('a bad id', mockUser())).rejects.toEqual(new HttpException('Failed to update user in db', HttpStatus.BAD_REQUEST));
    });

    it('should delete a user successfully', async () => {
        jest.spyOn(model, 'findOneAndDelete').mockReturnValueOnce(
            createMock<Query<UserDocument, UserDocument>>({
                exec: jest.fn().mockResolvedValueOnce({
                    _id: '623a8681e47db28bf073366d',
                    name: 'Tiki',
                    image: 'some/image',
                    email: 'some@email.com',
                    emailVerified: false,
                }),
            }) as any,
        );
        expect(await service.deleteUser('623a8681e47db28bf073366d')).toEqual(mockUser());
    });

    it('should not delete a user and error correctly', async () => {
        await expect(service.deleteUser('a bad id')).rejects.toThrow(HttpException);
        await expect(service.deleteUser('a bad id')).rejects.toEqual(new HttpException('Failed to delete user from db', HttpStatus.BAD_REQUEST));

    });

});