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
import * as _ from 'lodash';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        protected ethereumAccountMongoService: EthereumAccountMongoService,
        protected discordAccountMongoService: DiscordAccountMongoService,
    ) {
        // do nothing
    }

    async fetchAllUsers(): Promise<UserResponseDto[]> {
        try {

            const EthereumUsers = await this.ethereumAccountMongoService.aggregate([
                { $group: { '_id': '$user_id' } },
            ]);

            const DiscordUsers = await this.discordAccountMongoService.aggregate([
                { $group: { '_id': '$user_id' } },
            ]);

            const userSet = _.uniq(EthereumUsers, DiscordUsers);

            this.logger.debug(JSON.stringify(userSet));

            return await Promise.all(userSet.map(async (user) => {
                return await this.castToUserObject(user._id);
            }));

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

        const userObject = new UserResponseDto;

        userObject._id = userId;
        userObject.provider_accounts = [];

        const ethAccounts = await this.ethereumAccountMongoService.findManyAccount({ user_id: userId });

        if (ethAccounts) {
            ethAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as EthereumAccountResponseDto)));
        }

        const discAccounts = await this.discordAccountMongoService.findManyAccount({ user_id: userId });

        if (discAccounts) {
            discAccounts.forEach((account) => userObject.provider_accounts.push((account as unknown as DiscordAccountResponseDto)));
        }

        return userObject;
    }
}