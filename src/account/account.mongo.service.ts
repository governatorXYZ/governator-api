import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.schema';
import {AccountCreateDto, AccountResponseDto} from './account.dtos';

@Injectable()
export class AccountMongoService {
    private readonly logger = new Logger(AccountMongoService.name);

    constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {
        // do nothing
    }

    async findOneAccount(filter): Promise<Account | null> {
        let account: Account | null;

        try {
            account = await this.accountModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }

        return account;
    }

    async findManyAccount(filter): Promise<Account[] | null> {
        try {
            return await this.accountModel.find(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createAccount(accountCreateDto: AccountCreateDto): Promise<Account> {
        this.logger.debug('Creating new account');

        try {
            return await this.accountModel.create(accountCreateDto);

        } catch (e) {

            this.logger.error('Failed to create account in db', e);

            throw new HttpException('Failed to create account in db', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndDeleteAccount(filter) {
        try {
            return this.accountModel.findOneAndDelete(filter).exec();

        } catch (e) {
            this.logger.error('Failed to delete account', e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async findByIdAndUpdateAccount(id, updateDoc) {
        try {
            return this.accountModel.findByIdAndUpdate(id, updateDoc, { new: true }).exec();
        } catch (e) {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteManyAccount(accountsArray) {
        try {
            return this.accountModel.deleteMany(accountsArray).exec();

        } catch (e) {
            this.logger.error(`Failed to delete accounts ${accountsArray}`, e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async checkAndCreateAccount(account: AccountCreateDto): Promise<Account> {

        const existingAccount = await this.findOneAccount({
            user_id: account.user_id,
            provider_id: account.provider_id,
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