import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TokenWhitelist, TokenWhitelistDocument } from './token-whitelist.schema';
import { TokenWhitelistCreateDto } from './token-whitelist-dtos';

@Injectable()
export class TokenWhitelistMongoService {
    private readonly logger = new Logger(TokenWhitelistMongoService.name);

    constructor(
        @InjectModel(TokenWhitelist.name) private tokenWhitelistModel: Model<TokenWhitelistDocument>,
    ) {
        // do nothing
    }

    async findOneTokenWhitelist(filter): Promise<TokenWhitelist | null> {
        try {
            return await this.tokenWhitelistModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to find token in whitelist', e);

            throw new HttpException('Failed to find token in whitelist', HttpStatus.BAD_REQUEST);
        }
    }

    async findManyTokenWhitelist(filter): Promise<TokenWhitelist[] | null> {
        try {
            return await this.tokenWhitelistModel.find(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to find tokens in whitelist', e);

            throw new HttpException('Failed to find tokens in whitelist', HttpStatus.BAD_REQUEST);
        }
    }

    async createTokenWhitelist(tokenWhitelistCreateDto: TokenWhitelistCreateDto): Promise<TokenWhitelist> {
        this.logger.debug('Adding token to whitelist');

        try {
            return await this.tokenWhitelistModel.create(tokenWhitelistCreateDto);

        } catch (e) {

            this.logger.error('Failed to create record in token whitelist', e);

            throw new HttpException('Failed to create record in toke whitelist', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndDeleteTokenWhitelist(filter) {
        try {
            return this.tokenWhitelistModel.findOneAndDelete(filter).exec();

        } catch (e) {
            this.logger.error('Failed to delete token from whitelist', e);

            throw new HttpException('Failed to delete token from whitelist', HttpStatus.BAD_REQUEST);
        }
    }

    async findOneAndUpdateTokenWhitelist(filter, updateDoc) {
        try {
            return this.tokenWhitelistModel.findOneAndUpdate(filter, updateDoc, { new: true, upsert: false }).exec();
        } catch (e) {
            this.logger.error('Failed to update token whitelist', e);

            throw new HttpException('Failed to update token whitelist', HttpStatus.BAD_REQUEST);
        }
    }
}