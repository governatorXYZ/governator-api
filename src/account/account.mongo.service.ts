import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.schema';
import { AccountCreateDto } from './account.dtos';

@Injectable()
export class AccountMongoService {
    private readonly logger = new Logger(AccountMongoService.name);

    constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {
        // do nothing
    }

    async createAccount(accountCreateDto: AccountCreateDto): Promise<Account> {
        this.logger.debug('Creating new account in db');

        try {
            return await this.accountModel.create(accountCreateDto);

        } catch (e) {

            this.logger.error('Failed to create account in db', e);

            throw new HttpException('Failed to create account in db', HttpStatus.BAD_REQUEST);
        }
    }
}