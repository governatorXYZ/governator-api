import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Aggregate, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordAccountCreateDto, DiscordAccountResponseDto, DiscordAccountUpdateDto } from './account.dtos';
import { DiscordAccount, DiscordAccountDocument } from './discordAccount.schema';

@Injectable()
export class DiscordAccountMongoService {
    private readonly logger = new Logger(DiscordAccountMongoService.name);

    constructor(@InjectModel(DiscordAccount.name) private discordAccountModel: Model<DiscordAccountDocument>) {
        // do nothing
    }

    async findOneAccount(filter): Promise<DiscordAccountResponseDto | null> {
        try {
            return await this.discordAccountModel.findOne(filter).lean().exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    async findManyAccount(filter): Promise<DiscordAccount[] | null> {
        try {
            return await this.discordAccountModel.find(filter).lean().exec().catch((e) => {
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

    async findOneAndUpdateAccount(filter, updateDoc): Promise<DiscordAccountUpdateDto> {
        try {
            return this.discordAccountModel.findOneAndUpdate(filter, updateDoc, { new: true, upsert: true }).lean().exec();
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

        const existingAccount = await this.findOneAccount({ _id: account._id }).catch((e) => {
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

    async aggregate(filter): Promise<Aggregate<any[]>> {
        try {
            return await this.discordAccountModel.aggregate(filter).exec().catch((e) => {
                this.logger.error(e);

                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }
}