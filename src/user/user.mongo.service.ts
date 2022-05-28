import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class UserMongoService {
    private readonly logger = new Logger(UserMongoService.name);

    constructor(
        // @InjectModel(User.name) private userModel: Model<UserDocument>,
        protected ethereumAccountMongoService: EthereumAccountMongoService,
        protected discordAccountMongoService: DiscordAccountMongoService,
    ) {
        // do nothing
    }

    async fetchAllUsers(): Promise<UserResponseDto[]> {
        try {
            // const users = await this.userModel.find().lean().exec();

            const users = await this.ethereumAccountMongoService.aggregate([
                { $group: { '_id': '$user_id' } },
            ]);

            this.logger.debug(JSON.stringify(users));

            if (users.length === 0) return;

            const x = await Promise.all(users.flatMap(async (user) => {
                this.logger.debug(user._id);
                const userObject = await this.castToUserObject(user._id);
                this.logger.debug(userObject);
                return userObject;
            }));

            this.logger.debug(x);

            return x;

            // TODO remove
            // this.logger.log(x);
            //
            // this.logger.log(x.flat());
            //
            // return x.flat();

        } catch (e) {
            this.logger.error('Failed to fetch users from db', e);

            throw new HttpException('Failed to fetch users from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchUserById(id): Promise<UserResponseDto> {
        try {
            return await this.castToUserObject(id);

        } catch (e) {
            this.logger.error('Failed to fetch user from db', e);

            throw new HttpException('Failed to fetch user from db', HttpStatus.BAD_REQUEST);
        }
    }

    // TODO remove

    // async fetchUserById(id): Promise<UserResponseDto> {
    //     try {
    //         const user = await this.userModel.findById(id).lean().exec();
    //
    //         return await this.castToUserObject(user);
    //
    //     } catch (e) {
    //         this.logger.error('Failed to fetch user from db', e);
    //
    //         throw new HttpException('Failed to fetch user from db', HttpStatus.BAD_REQUEST);
    //     }
    // }

    async fetchUserByProvider(providerId, accountId): Promise<UserResponseDto> {

        if (!Array.from(constants.PROVIDERS.keys()).includes(providerId)) throw new HttpException('Invalid provider Id', HttpStatus.NOT_FOUND);

        let account: EthereumAccount | DiscordAccount | null;

        switch (providerId) {
        case 'ethereum':
            account = await this.ethereumAccountMongoService.findOneAccount({ _id: accountId });
            break;
        case 'discord':
            account = await this.discordAccountMongoService.findOneAccount({ _id: accountId });
            break;
        default:
            this.logger.error('providerId missmatch - this should not happen');
            throw new HttpException('Account not found', HttpStatus.BAD_REQUEST);
        }

        if (!account) {
            throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }

        return this.castToUserObject(account.user_id);

    }

    async castToUserObject(userId) {

        this.logger.log('casting user object');

        // const userObject = plainToInstance(UserResponseDto, user, {
        //     excludeExtraneousValues: false,
        // }) as UserResponseDto;

        const userObject = new UserResponseDto;

        userObject._id = userId;
        userObject.provider_accounts = [];

        const ethAccounts = await this.ethereumAccountMongoService.findManyAccount({ user_id: userId });

        this.logger.debug(ethAccounts);

        if (ethAccounts) {
            ethAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as EthereumAccountResponseDto)));
        }

        const discAccounts = await this.discordAccountMongoService.findManyAccount({ user_id: userId });

        this.logger.debug(discAccounts);

        if (discAccounts) {
            discAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as DiscordAccountResponseDto)));
        }

        return userObject;
    }

    // TODO remove
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

    // async createUser(): Promise<UserResponseDto> {
    //     this.logger.debug('Creating new user in db');
    //
    //     try {
    //         const user = await this.userModel.create({});
    //
    //         const leanUser = await this.userModel.findById(user.id).lean().exec();
    //
    //         return await this.castToUserObject(leanUser);
    //
    //     } catch (e) {
    //
    //         this.logger.error('Failed to create user in db', e);
    //
    //         throw new HttpException('Failed to create user in db', HttpStatus.BAD_REQUEST);
    //     }
    // }
    //
    // async updateUser(id, updateDoc): Promise<UserResponseDto> {
    //     try {
    //         const user = await this.userModel.findByIdAndUpdate(id, updateDoc, { new: true }).lean().exec();
    //
    //         return await this.castToUserObject(user);
    //
    //     } catch (e) {
    //         this.logger.error('Failed to update user in db', e);
    //
    //         throw new HttpException('Failed to update user in db', HttpStatus.BAD_REQUEST);
    //     }
    //
    // }
    //
    // async deleteUser(id): Promise<User> {
    //     try {
    //
    //         this.logger.log('deleting linked user accounts');
    //
    //         const ethAccounts = await this.ethereumAccountMongoService.findManyAccount({ user_id: id });
    //
    //         const discAccounts = await this.discordAccountMongoService.findManyAccount({ user_id: id });
    //
    //         this.logger.debug(`found the following user accounts for user ${id}`);
    //
    //         ethAccounts.forEach((account) => this.logger.debug(account));
    //
    //         discAccounts.forEach((account) => this.logger.debug(account));
    //
    //         await this.ethereumAccountMongoService.deleteManyAccount(ethAccounts);
    //
    //         await this.discordAccountMongoService.deleteManyAccount(discAccounts);
    //
    //         this.logger.log('accounts deleted successfully');
    //
    //         return this.userModel.findOneAndDelete({ _id: id }).exec();
    //
    //     } catch (e) {
    //         this.logger.error('Failed to delete user from db', e);
    //
    //         throw new HttpException('Failed to delete user from db', HttpStatus.BAD_REQUEST);
    //     }
    // }

}