import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { UserCreateDto } from './user.dtos';
import { Account, AccountDocument } from '../account/account.schema';

@Injectable()
export class UserMongoService {
    private readonly logger = new Logger(UserMongoService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
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

    async createUser(userCreateDto: UserCreateDto): Promise<User> {
        this.logger.debug('Creating new user in db');

        try {
            const createdUser = new this.userModel(userCreateDto);

            return await createdUser.save();

        } catch (e) {

            this.logger.error('Failed to create user in db', e);

            throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
        }
    }

    // TODO make sure ID can not be updated
    async updateUser(id, user): Promise<User> {
        try {
            return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();

        } catch (e) {
            this.logger.error('Failed to update user in db', e);

            throw new HttpException('Failed to update user in db', HttpStatus.BAD_REQUEST);
        }

    }

    // TODO extend to delete existing user accounts
    async deleteUser(id): Promise<User> {
        try {
            return this.userModel.findOneAndDelete({ _id: id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete user from db', e);

            throw new HttpException('Failed to delete user from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserByProvider(providerId, providerAccountId): Promise<User> {

        let account: Account | null;

        try {
            account = await this.accountModel.findOne({ provider_id: providerId, provider_account_id: providerAccountId }).exec();

        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }

        if (!account) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }

        return this.fetchUserById(account.user_id);

    }

    // TODO add validation to make sure user has not linked a provider account already
    async addProviderAccount(id, account): Promise<Account> {

        account.user_id = id;

        try {
            const createdAccount = new this.accountModel(account);

            return await createdAccount.save();

        } catch (e) {
            this.logger.error('Failed to create account', e);

            throw new HttpException('Failed to create account', HttpStatus.BAD_REQUEST);
        }

    }

    async removeProviderAccount(id, account): Promise<Account> {

        try {
            return this.accountModel.findOneAndDelete({ user_id: id, provider_id: account.provider_id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete account', e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }

    }
}