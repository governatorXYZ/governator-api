import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserMongoService } from './user.mongo.service';
import { UserCreateDto, UserUpdateDto } from './user.dtos';
import { AccountCreateDto } from '../account/account.dtos';

describe('Test UserController', () => {

    const testObjectId = '999a8681e47db28bf0000222';
    const testUser = {
        name: 'Tiki',
        image: 'some/image',
        email: 'email@email.com',
        emailVerified: true,
    };

    const testAccount = {
        user_id: '999a8681e47db28bf0000222',
        provider_type: 'oauth',
        provider_id: 'discord',
        provider_account_id: '1234567',
        refresh_token: 'string',
        access_token: 'string',
        access_token_expires: new Date(Date.now()),
    };

    let userController: UserController;
    // let mockSseService: any;
    beforeEach(async () => {

        class UserMongoServiceMock {
            fetchAllUsers() { return true; }
            createUser(userCreateDto: UserCreateDto) { return userCreateDto; }
            fetchUserById(id) { return id; }
            updateUser(id, user: UserUpdateDto) { return user; }
            // eslint-disable-next-line
            deleteUser(id) { return testUser; }
            // eslint-disable-next-line
            fetchUserByProvider(provider_id, provider_account_id) { return testUser; }
            addProviderAccount(id, account: AccountCreateDto) { return account; }
            removeProviderAccount(id, account: AccountCreateDto) { return account; }
        }

        // Mock mongo service response
        const MongoFake = {
            provide: UserMongoService,
            useClass: UserMongoServiceMock,
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [MongoFake],
        }).compile();

        userController = moduleFixture.get<UserController>(UserController);
    });

    it('checks if controller invokes UserMongoService', async () => {

        expect(await userController.fetchAllUsers()).toBe(true);
        expect(await userController.createUser(testUser)).toEqual(testUser);
        expect(await userController.fetchUserById(testObjectId)).toEqual(testObjectId);
        expect(await userController.updateUser(testObjectId, testUser)).toEqual(testUser);
        expect(await userController.deleteUser(testObjectId)).toEqual(testUser);
        expect(await userController.fetchUserByProvider('provider', '1')).toEqual(testUser);
        expect(await userController.addProviderAccount(testObjectId, testAccount)).toEqual(testAccount);
        expect(await userController.removeProviderAccount(testObjectId, testAccount)).toEqual(testAccount);
    });
});

describe('Validation Unit Tests - test DTO against nestjs validation pipeline', () => {

    it('tests validation pipeline - using UserCreateDto', async () => {

        const testUser = {
            email: 'email@email.com',
            emailVerified: true,
        };

        const testUserInvalidEmail = {
            email: 'just a string',
            emailVerified: true,
        };

        const testUserInvalidBool = {
            email: 'email@email.com',
            emailVerified: 'true',
        };

        const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: UserCreateDto,
            data: '',
        };

        // valid
        await expect(target.transform(testUser, metadata)).resolves.toEqual(testUser);

        // violates email constraint
        await expect(target.transform(testUserInvalidEmail, metadata)).rejects.toThrowError();

        // violates bool constraint
        await expect(target.transform(testUserInvalidBool, metadata)).rejects.toThrowError();
    });
});