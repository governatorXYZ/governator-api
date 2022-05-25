import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordAccountCreateDto } from './account.dtos';
import { DiscordAccount, DiscordAccountDocument } from './discordAccount.schema';

@Injectable()
export class DiscordAccountMongoService {
    private readonly logger = new Logger(DiscordAccountMongoService.name);

    constructor(@InjectModel(DiscordAccount.name) private discordAccountModel: Model<DiscordAccountDocument>) {
        // do nothing
    }

    async findOneAccount(filter): Promise<DiscordAccount | null> {
        let account: DiscordAccount | null;

        try {
            account = await this.discordAccountModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }

        return account;
    }

    async findManyAccount(filter): Promise<DiscordAccount[] | null> {
        try {
            return await this.discordAccountModel.find(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createAccount(accountCreateDto: DiscordAccountCreateDto): Promise<DiscordAccount> {
        this.logger.debug('Creating new account');

        try {
            return await this.discordAccountModel.create(accountCreateDto);

        } catch (e) {

            this.logger.error('Failed to create account in db', e);

            throw new HttpException('Failed to create account in db', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndDeleteAccount(filter) {
        try {
            return this.discordAccountModel.findOneAndDelete(filter).exec();

        } catch (e) {
            this.logger.error('Failed to delete account', e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async findByIdAndUpdateAccount(id, updateDoc) {
        try {
            return this.discordAccountModel.findByIdAndUpdate(id, updateDoc, { new: true }).exec();
        } catch (e) {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteManyAccount(accountsArray) {
        try {
            return this.discordAccountModel.deleteMany(accountsArray).exec();

        } catch (e) {
            this.logger.error(`Failed to delete accounts ${accountsArray}`, e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async checkAndCreateAccount(account: DiscordAccountCreateDto): Promise<DiscordAccount> {

        const existingAccount = await this.findOneAccount({
            user_id: account.user_id,
            provider_id: 'discord',
        }).catch((e) => {
            this.logger.error('account not found', e);
            return null;
        });

        if (existingAccount !== null) throw new HttpException('Account exists', HttpStatus.BAD_REQUEST);

        try {
            return this.createAccount(account);

        } catch (e) {
            this.logger.error('Failed to create account', e);

            throw new HttpException('Failed to create account', HttpStatus.BAD_REQUEST);
        }

    }
}