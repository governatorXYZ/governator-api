import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TokenWhitelist, TokenWhitelistDocument } from './token-whitelist.schema';
import { TokenMeta, TokenWhitelistCreateDto, TokenWhitelistResponseDto } from './token-whitelist-dtos';
import { Contract } from 'ethers';
import { Token } from '../../web3.dtos';
import web3Utils from '../../web3.util';

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
            (tokenWhitelistCreateDto as TokenWhitelistResponseDto).meta = await this.decorateToken(tokenWhitelistCreateDto._id);
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

    async decorateToken(token: Token): Promise<TokenMeta> {
        this.logger.log('fetching token metadata');

        const tokenMeta = new TokenMeta();

        const provider = web3Utils.getEthersProvider(token.chain_id);

        const abi = [
            'function name() external view returns (string)',
            'function symbol() external view returns (string)',
        ];

        const tokenContract = new Contract(
            token.contractAddress,
            abi,
        );

        const connectedToken = tokenContract.connect(provider);

        try {
            tokenMeta.name = await connectedToken.name();
        } catch (e) {
            this.logger.error(`failed to fetch token name for token address ${token.contractAddress}`, e);
        }

        try {
            tokenMeta.symbol = await connectedToken.symbol();
        } catch (e) {
            this.logger.error(`failed to fetch token symbol for token address ${token.contractAddress}`, e);
        }

        return tokenMeta;
    }
}