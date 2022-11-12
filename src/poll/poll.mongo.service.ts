import { HttpException, HttpStatus, Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from './poll.schema';
import {PollCreateDto, StrategyConfig} from './poll.dtos';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import constants from '../common/constants';
import { SseService } from '../sse/sse.service';
import { StrategyMongoService } from '../web3/strategy/strategy.mongo.service';

@Injectable()
export class PollMongoService {
    private readonly logger = new Logger(PollMongoService.name);

    constructor(
        @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
        private schedulerRegistry: SchedulerRegistry,
        protected sseService: SseService,
        protected strategyService: StrategyMongoService,
    ) {
        // do nothing
    }
    async createPoll(pollCreateDto: PollCreateDto): Promise<Poll> {
        this.logger.log('Creating new poll in db');

        try {
            // add strategy_type to strategy_config
            const updatedStratConf: StrategyConfig[] = [];
            for (const strategy of pollCreateDto.strategy_config.values()) {
                strategy.strategy_type = (await this.strategyService.findOneStrategy({ _id: strategy.strategy_id })).strategy_type;
                updatedStratConf.push(strategy);
            }
            pollCreateDto.strategy_config = updatedStratConf;
            const newPoll = await this.pollModel.create(pollCreateDto);
            const job = new CronJob(new Date(newPoll.end_time), () => {
                this.logger.warn(`cron job running for ${newPoll.id}`);
                this.endPoll(newPoll.id);
            });
            this.schedulerRegistry.addCronJob(newPoll.id, job);
            job.start();
            this.logger.warn(`Cron job created for Poll ID ${newPoll.id} running on ${this.schedulerRegistry.getCronJob(newPoll.id).nextDate()}`);

            this.logger.debug(JSON.stringify(newPoll));

            return newPoll;

        } catch (e) {

            this.logger.error('Failed to create poll in db', e);

            throw new HttpException('Failed to create poll in db', HttpStatus.BAD_REQUEST);
        }
    }

    async endPoll(pollId) {
        this.logger.warn(`poll end has been called on Poll ${pollId}. Emitting POLL_COMPLETE event`);

        await this.sseService.emit({
            data: pollId,
            type: constants.EVENT_POLL_COMPLETE,
        } as MessageEvent);
    }

    async fetchAllPolls(): Promise<Poll[]> {
        try {
            return await this.pollModel.find().exec();

        } catch (e) {
            this.logger.error('Failed to fetch polls from db', e);

            throw new HttpException('Failed to fetch polls from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchPollById(id): Promise<Poll> {
        try {
            return await this.pollModel.findById(id).exec();

        } catch (e) {
            this.logger.error('Failed to fetch poll from db', e);

            throw new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST);
        }
    }

    async updatePoll(id, poll): Promise<Poll> {
        try {
            return this.pollModel.findByIdAndUpdate(id, poll, { new: true }).exec();

        } catch (e) {
            this.logger.error('Failed to update poll in db', e);

            throw new HttpException('Failed to update poll in db', HttpStatus.BAD_REQUEST);
        }

    }

    async deletePoll(id): Promise<any> {
        try {
            return this.pollModel.findOneAndDelete({ _id: id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete poll from db', e);

            throw new HttpException('Failed to delete poll from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchPollByUser(user_id): Promise<Poll[]> {
        try {
            return this.pollModel.find({ author_user_id: user_id }).exec();

        } catch (e) {
            this.logger.error('Failed to fetch poll from db', e);

            throw new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchPollByUserOngoing(user_id): Promise<Poll[]> {
        try {
            return this.pollModel.find({ author_user_id: user_id,
                end_time: {
                    $gt:  new Date(Date.now()),
                } }).exec();

        } catch (e) {
            this.logger.error('Failed to fetch poll from db', e);

            throw new HttpException('Failed to fetch poll from db', HttpStatus.BAD_REQUEST);
        }
    }
}
