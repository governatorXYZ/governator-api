import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { UserCreateDto } from './user.dtos';
import { AccountMongoService } from '../account/account.mongo.service';
import {AccountCreateDto, AccountUpdateDto} from "../account/account.dtos";

@Injectable()
export class UserMongoService {
    private readonly logger = new Logger(UserMongoService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        protected accountMongoService: AccountMongoService,
    ) {
        // do nothing
    }

    async fetchAllUsers(): Promise<User[]> {
        try {
            return await this.userModel.find().exec();

        } catch (e) {
            this.logger.error('Failed to fetch users from db', e);

            throw new HttpException('Failed to fetch users from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserById(id): Promise<User> {
        try {
            return await this.userModel.findById(id).exec();

        } catch (e) {
            this.logger.error('Failed to fetch user from db', e);

            throw new HttpException('Failed to fetch user from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createUser(): Promise<User> {
        this.logger.debug('Creating new user in db');

        try {
            return await this.userModel.create({});

        } catch (e) {

            this.logger.error('Failed to create user in db', e);

            throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
        }
    }

    async updateUser(id, user): Promise<User> {
        try {
            return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();

        } catch (e) {
            this.logger.error('Failed to update user in db', e);

            throw new HttpException('Failed to update user in db', HttpStatus.BAD_REQUEST);
        }

    }

    async deleteUser(id): Promise<User> {
        try {

            this.logger.log('deleting linked user accounts');

            const accounts = await this.accountMongoService.findManyAccount({ user_id: id });

            this.logger.debug(`found the following user accounts for user ${id}`);

            accounts.forEach((account) => this.logger.debug(account));

            await this.accountMongoService.deleteManyAccount(accounts);

            this.logger.log('accounts deleted successfully');

            return this.userModel.findOneAndDelete({ _id: id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete user from db', e);

            throw new HttpException('Failed to delete user from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserByProvider(providerId, providerAccountId): Promise<User> {

        const account = await this.accountMongoService.findOneAccount({ provider_id: providerId, provider_account: { provider_account_id: providerAccountId } });

        if (!account) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }

        return this.fetchUserById(account.user_id);

    }

    async createUserWithAccounts(accounts: AccountUpdateDto[]): Promise<User> {
        this.logger.debug('Creating new user with accounts');

        try {
            const user = await this.userModel.create({});

            accounts.forEach((account) => {
                const createAccount: AccountCreateDto = (account.user_id = user.id);
                this.accountMongoService.createAccount(createAccount);
            });

            return user;

        } catch (e) {

            this.logger.error('Failed to create user in db', e);

            throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
        }
    }

}