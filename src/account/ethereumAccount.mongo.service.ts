import {forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import { Model, Aggregate } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EthereumAccountCreateDto, EthereumAccountUpdateDto } from './account.dtos';
import { EthereumAccount, EthereumAccountDocument } from './ethereumAccount.schema';
import { Web3Service } from '../web3/web3.service';
import * as siwe from 'siwe';

@Injectable()
export class EthereumAccountMongoService {
    private readonly logger = new Logger(EthereumAccountMongoService.name);

    constructor(
        @InjectModel(EthereumAccount.name) private ethereumAccountModel: Model<EthereumAccountDocument>,
        @Inject(forwardRef(() => Web3Service))
        // TODO remove circular reference if not needed
        private web3MongoService: Web3Service,
    ) {
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
            // (updateAccount as EthereumAccountUpdateDto).verification_message = this.web3MongoService.generateVerificationMessage(accountId);
            (updateAccount as EthereumAccountUpdateDto).nonce = siwe.generateNonce();
            // TODO remove
            // this.logger.debug((updateAccount as EthereumAccountUpdateDto).nonce);
            // // const siweMessage = new siweParser.ParsedMessage((updateAccount as EthereumAccountUpdateDto).verification_message);
            // // const siweMessage = new siweParser.ParsedMessageRegExp("localhost wants you to sign in with your Ethereum account:\n0xb0754B937bD306fE72264274A61BC03F43FB685F\n\nBy signing this message you accept to send me all your ETH\n\nURI: http://localhost\nVersion: 1\nChain ID: 1\nNonce: AOjTt8afBGPlb6LoQ\nIssued At: 2022-05-29T04:48:53.273Z\nResources:\n- 124356678299");
            // const siweMessage = new siwe.SiweMessage((updateAccount as EthereumAccountUpdateDto).verification_message);
            // this.logger.debug(JSON.stringify(siweMessage));
            // this.logger.debug(siweMessage.resources);
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
}