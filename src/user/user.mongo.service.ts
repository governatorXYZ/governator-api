import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { UserResponseDto } from './user.dtos';
import {
    DiscordAccountResponseDto,
    EthereumAccountResponseDto,
} from '../account/account.dtos';
import { EthereumAccountMongoService } from '../account/ethereumAccount.mongo.service';
import { DiscordAccountMongoService } from '../account/discordAccount.mongo.service';
import constants from '../common/constants';
import { EthereumAccount } from '../account/ethereumAccount.schema';
import { DiscordAccount } from '../account/discordAccount.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserMongoService {
    private readonly logger = new Logger(UserMongoService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        protected ethereumAccountMongoService: EthereumAccountMongoService,
        protected discordAccountMongoService: DiscordAccountMongoService,
    ) {
        // do nothing
    }

    async fetchAllUsers(): Promise<UserResponseDto[]> {
        try {
            const users = await this.userModel.find().lean().exec();

            return await Promise.all(users.map(async (user) => await this.castToUserObject(user)));

        } catch (e) {
            this.logger.error('Failed to fetch users from db', e);

            throw new HttpException('Failed to fetch users from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserById(id): Promise<UserResponseDto> {
        try {
            const user = await this.userModel.findById(id).lean().exec();

            return await this.castToUserObject(user);

        } catch (e) {
            this.logger.error('Failed to fetch user from db', e);

            throw new HttpException('Failed to fetch user from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createUser(): Promise<UserResponseDto> {
        this.logger.debug('Creating new user in db');

        try {
            const user = await this.userModel.create({});

            const leanUser = await this.userModel.findById(user.id).lean().exec();

            this.logger.log(leanUser);

            return await this.castToUserObject(leanUser);

        } catch (e) {

            this.logger.error('Failed to create user in db', e);

            throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
        }
    }

    async updateUser(id, updateDoc): Promise<UserResponseDto> {
        try {
            const user = await this.userModel.findByIdAndUpdate(id, updateDoc, { new: true }).lean().exec();

            return await this.castToUserObject(user);

        } catch (e) {
            this.logger.error('Failed to update user in db', e);

            throw new HttpException('Failed to update user in db', HttpStatus.BAD_REQUEST);
        }

    }

    async deleteUser(id): Promise<User> {
        try {

            this.logger.log('deleting linked user accounts');

            const ethAccounts = await this.ethereumAccountMongoService.findManyAccount({ user_id: id });

            const discAccounts = await this.discordAccountMongoService.findManyAccount({ user_id: id });

            this.logger.debug(`found the following user accounts for user ${id}`);

            ethAccounts.forEach((account) => this.logger.debug(account));

            discAccounts.forEach((account) => this.logger.debug(account));

            await this.ethereumAccountMongoService.deleteManyAccount(ethAccounts);

            await this.discordAccountMongoService.deleteManyAccount(discAccounts);

            this.logger.log('accounts deleted successfully');

            return this.userModel.findOneAndDelete({ _id: id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete user from db', e);

            throw new HttpException('Failed to delete user from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserByProvider(providerId, providerAccountId): Promise<User> {

        if (!Array.from(constants.PROVIDERS.keys()).includes(providerId)) throw new HttpException('Invalid provider Id', HttpStatus.NOT_FOUND);

        let account: EthereumAccount | DiscordAccount | null;

        switch (providerId) {
        case 'ethereum':
            account = await this.ethereumAccountMongoService.findOneAccount({ provider_id: providerId, provider_account_id: providerAccountId });
            break;
        case 'discord':
            account = await this.discordAccountMongoService.findOneAccount({ provider_id: providerId, provider_account_id: providerAccountId });
            break;
        default:
            this.logger.error('providerId missmatch - this should not happen');
            throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
        }

        if (!account) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }

        return this.fetchUserById(account.user_id);

    }

    // async createUserWithAccounts(accounts: (EthereumAccountCreateDto|DiscordAccountCreateDto)[]): Promise<User> {
    //     this.logger.debug('Creating new user with accounts');
    //
    //     try {
    //         const user = await this.userModel.create({});
    //
    //         accounts.forEach((account) => {
    //             const createAccount: EthereumAccountCreateDto|DiscordAccountCreateDto = (account.user_id = user.id);
    //             if (account)
    //             this.accountMongoService.createAccount(createAccount);
    //         });
    //
    //         return user;
    //
    //     } catch (e) {
    //
    //         this.logger.error('Failed to create user in db', e);
    //
    //         throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
    //     }
    // }

    async castToUserObject(user) {
        const userObject = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: false,
        }) as UserResponseDto;

        this.logger.log(JSON.stringify(userObject));

        const ethAccounts = await this.ethereumAccountMongoService.findManyAccount({ user_id: user.id });

        ethAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as EthereumAccountResponseDto)));

        const discAccounts = await this.discordAccountMongoService.findManyAccount({ user_id: user.id });

        discAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as DiscordAccountResponseDto)));

        return userObject;
    }

}