import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, StrategyDocument } from './strategy.schema';

@Injectable()
export class StrategyMongoService {
    private readonly logger = new Logger(StrategyMongoService.name);

    constructor(
        @InjectModel(Strategy.name) private strategyModel: Model<StrategyDocument>,
    ) {
        // do nothing
    }

    async findManyStrategy(filter): Promise<Strategy[] | null> {
        try {
            return await this.strategyModel.find(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to find strategy', e);

            throw new HttpException('Failed to find strategy', HttpStatus.BAD_REQUEST);
        }
    }

    async updateOneByIdStrategy(id, filter): Promise<Strategy> {
        try {
            return this.strategyModel.findByIdAndUpdate(id, filter, { new: true, upsert: true }).exec();

        } catch (e) {
            this.logger.error('Failed to update strategy', e);

            throw new HttpException('Failed to update strategy', HttpStatus.BAD_REQUEST);
        }

    }

    async deleteOneByIdStrategy(id): Promise<Strategy> {
        try {
            return this.strategyModel.findByIdAndDelete(id).exec();

        } catch (e) {
            this.logger.error('Failed to delete strategy', e);

            throw new HttpException('Failed to delete strategy', HttpStatus.BAD_REQUEST);
        }

    }

    async findOneStrategy(filter): Promise<Strategy | null> {
        try {
            return await this.strategyModel.findOne(filter).exec().catch((e) => {
                this.logger.error(e);
                return null;
            });
        } catch (e) {
            this.logger.error('Failed to find strategy', e);

            throw new HttpException('Failed to find strategy', HttpStatus.BAD_REQUEST);
        }
    }

    // TODO remove if not needed
    // async createStrategy(strategy: StrategyCreateDto): Promise<Strategy> {
    //     this.logger.debug('Adding strategy to db');
    //
    //     try {
    //         return await this.strategyModel.create(strategy);
    //
    //     } catch (e) {
    //
    //         this.logger.error('Failed to create strategy registry', e);
    //
    //         throw new HttpException('Failed to create strategy registry', HttpStatus.BAD_REQUEST);
    //     }
    // }

}