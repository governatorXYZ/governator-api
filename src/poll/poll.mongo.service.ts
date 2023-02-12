import { HttpException, HttpStatus, Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from './poll.schema';
import { PollCreateDto, StrategyConfig } from './poll.dtos';
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

    async onApplicationBootstrap(): Promise<void> {
        this.logger.debug('Creating CRON jobs for all active Polls');

        const now = new Date(Date.now());

        try {
            const polls = await this.pollModel.find({ end_time : {
                $gte: now.toISOString(),
            } }).exec();

            polls.forEach((poll) => {
                this.createPollEndScheduler(poll);
            });

        } catch (e) {
            this.logger.error('Failed to fetch polls from db', e);

            throw new HttpException('Failed to fetch polls from db', HttpStatus.BAD_REQUEST);
        }
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

            await this.createPollEndScheduler(newPoll);

            this.logger.debug(JSON.stringify(newPoll));
            return newPoll;

        } catch (e) {

            this.logger.error('Failed to create poll in db', e);

            throw new HttpException('Failed to create poll in db', HttpStatus.BAD_REQUEST);
        }
    }

    async createPollEndScheduler(poll: Poll) {
        const job = new CronJob(new Date(poll.end_time), () => {
            this.logger.warn(`cron job running for ${poll._id}`);

            this.endPoll(poll._id);
        });

        this.schedulerRegistry.addCronJob(poll._id, job);

        job.start();

        this.logger.warn(`Cron job created for Poll ID ${poll._id} running on ${this.schedulerRegistry.getCronJob(poll._id).nextDate()}`);
    }

    async endPoll(pollId: string) {
        this.logger.warn(`poll end has been called on Poll ${pollId}. Emitting POLL_COMPLETE event`);

        this.sseService.emit({
            data: { poll_id: pollId },
            type: constants.EVENT_POLL_COMPLETE,
        } as MessageEvent);
    }

    async fetchAllPolls(filter: Record<any, any> = {}): Promise<Poll[]> {
        try {
            return await this.pollModel.find(filter).exec();

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

    async deletePoll(id: string): Promise<any> {
        try {

            this.pollModel.findOneAndDelete({ _id: id }).exec();

            if (this.schedulerRegistry.doesExist('cron', id)) this.schedulerRegistry.deleteCronJob(id);

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
