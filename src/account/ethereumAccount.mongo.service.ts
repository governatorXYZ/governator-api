import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model, Aggregate } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EthereumAccountCreateDto, EthereumAccountUpdateDto } from './account.dtos';
import { EthereumAccount, EthereumAccountDocument } from './ethereumAccount.schema';

@Injectable()
export class EthereumAccountMongoService {
    private readonly logger = new Logger(EthereumAccountMongoService.name);

    constructor(@InjectModel(EthereumAccount.name) private ethereumAccountModel: Model<EthereumAccountDocument>) {
        // do nothing
    }

    async findOneAccount(filter): Promise<EthereumAccount | null> {
        try {
            return await this.ethereumAccountModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    async findManyAccount(filter): Promise<EthereumAccount[] | null> {
        try {
            return await this.ethereumAccountModel.find(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createAccount(accountCreateDto: EthereumAccountCreateDto): Promise<EthereumAccount> {
        this.logger.debug('Creating new account');

        try {
            return await this.ethereumAccountModel.create(accountCreateDto);

        } catch (e) {

            this.logger.error('Failed to create account in db', e);

            throw new HttpException('Failed to create account in db', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndDeleteAccount(filter) {
        try {
            return this.ethereumAccountModel.findOneAndDelete(filter).exec();

        } catch (e) {
            this.logger.error('Failed to delete account', e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndUpdateAccount(filter, updateDoc) {
        try {
            return this.ethereumAccountModel.findOneAndUpdate(filter, updateDoc, { new: true, upsert: false }).exec();
        } catch (e) {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteManyAccount(accountsArray) {
        try {
            return this.ethereumAccountModel.deleteMany(accountsArray).exec();

        } catch (e) {
            this.logger.error(`Failed to delete accounts ${accountsArray}`, e);

            throw new HttpException('Failed to delete account', HttpStatus.BAD_REQUEST);
        }
    }

    async checkAndCreateAccount(accountId): Promise<EthereumAccount> {

        const existingAccount = await this.findOneAccount({
            _id: accountId,
        }).catch((e) => {
            this.logger.debug('account not found', e);
            return null;
        });

        if (existingAccount !== null) throw new HttpException('Account exists', HttpStatus.BAD_REQUEST);

        const updateAccount = new EthereumAccountCreateDto();
        updateAccount._id = accountId;

        try {
            (updateAccount as EthereumAccountUpdateDto).verification_message = this.generateVerificationMessage();
            return this.createAccount(updateAccount);

        } catch (e) {
            this.logger.error('Failed to create account', e);

            throw new HttpException('Failed to create account', HttpStatus.BAD_REQUEST);
        }

    }

    async aggregate(filter): Promise<Aggregate<any[]>> {
        try {

            this.logger.debug(filter);

            return await this.ethereumAccountModel.aggregate(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }

    generateVerificationMessage() {
        return 'Please sign this message: \n By signing this you accept anything and everything';
    }
}