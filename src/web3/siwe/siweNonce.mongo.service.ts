import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SiweNonce, SiweNonceDocument } from './siweNonce.schema';

@Injectable()
export class SiweNonceMongoService {
    private readonly logger = new Logger(SiweNonceMongoService.name);

    constructor(
        @InjectModel(SiweNonce.name) private siweNonceModel: Model<SiweNonceDocument>,
    ) {
        // do nothing
    }

    async createSiweNonce(address: string, nonce: string): Promise<SiweNonce> {
        this.logger.debug('Creating temporary nonce record');

        await this.siweNonceModel.findByIdAndDelete(address).exec().catch();

        try {
            return await this.siweNonceModel.create({ _id: address, nonce: nonce });

        } catch (e) {
            const error = e as Error;

            this.logger.error('Failed to create nonce', e);

            throw new HttpException(`Failed to create nonce ${error}`, HttpStatus.BAD_REQUEST);
        }
    }

    async findOneSiweNonce(filter): Promise<SiweNonce | null> {
        try {
            return await this.siweNonceModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to fetch account from db', e);

            throw new HttpException('Failed to fetch account from db', HttpStatus.BAD_REQUEST);
        }
    }
}