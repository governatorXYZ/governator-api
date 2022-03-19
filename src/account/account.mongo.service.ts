import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.schema';
// import { CreateAccountDto } from '../dtos/account.dtos';

@Injectable()
export class AccountMongoService {
    constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {
        // do nothing
    }
}