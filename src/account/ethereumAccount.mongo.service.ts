import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {EthereumAccountCreateDto, EthereumAccountUpdateDto} from './account.dtos';
import {EthereumAccount, EthereumAccountDocument} from './ethereumAccount.schema';

@Injectable()
export class EthereumAccountMongoService {
    private readonly logger = new Logger(EthereumAccountMongoService.name);

    constructor(@InjectModel(EthereumAccount.name) private ethereumAccountModel: Model<EthereumAccountDocument>) {
        // do nothing
    }

    async findOneAccount(filter): Promise<EthereumAccount | null> {
        let account: EthereumAccount | null;

        try {
            account = await this.ethereumAccountModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }

        return account;
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

    async findByIdAndUpdateAccount(id, updateDoc) {
        try {
            return this.ethereumAccountModel.findByIdAndUpdate(id, updateDoc, { new: true }).exec();
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

    async checkAndCreateAccount(account: EthereumAccountCreateDto): Promise<EthereumAccount> {

        const existingAccount = await this.findOneAccount({
            user_id: account.user_id,
            provider_id: 'ethereum',
        }).catch((e) => {
            this.logger.error('account not found', e);
            return null;
        });

        if (existingAccount !== null) throw new HttpException('Account exists', HttpStatus.BAD_REQUEST);

        try {
            (account as EthereumAccountUpdateDto).verification_message = this.generateVerificationMessage();
            return this.createAccount(account);

        } catch (e) {
            this.logger.error('Failed to create account', e);

            throw new HttpException('Failed to create account', HttpStatus.BAD_REQUEST);
        }

    }

    generateVerificationMessage() {
        return 'Please sign this message: \n By signing this you accept anything and everything';
    }
}