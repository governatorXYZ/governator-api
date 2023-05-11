import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Auth, AuthDocument } from './auth.schema';
import { UpdateResult } from 'mongodb';

interface AuthCreate {
    api_key_hashes: string[]
}

@Injectable()
export class AuthMongoService {
    private readonly logger = new Logger(AuthMongoService.name);

    constructor(
        @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    ) {
        // do nothing
    }

    async findOne(): Promise<Auth> {
        try {

            return this.authModel.findOne().exec();

        } catch (e) {
            this.logger.error('Failed to fetch record', e);

            throw new HttpException('Failed to fetch record from db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async create(document: AuthCreate): Promise<Auth> {
        try {

            return this.authModel.create(document);


        } catch (e) {
            this.logger.error('Failed to create record', e);

            throw new HttpException('Failed to create record in db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateOne(filter: any, document: AuthCreate): Promise<UpdateResult> {
        try {

            return this.authModel.updateOne(filter, document).exec();


        } catch (e) {
            this.logger.error('Failed to update record', e);

            throw new HttpException('Failed to update record in db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
