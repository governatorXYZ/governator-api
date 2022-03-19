import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from './poll.schema';
import { CreatePollDto } from './poll.dtos';

@Injectable()
export class PollMongoService {
    private readonly logger = new Logger(PollMongoService.name);

    constructor(@InjectModel(Poll.name) private pollModel: Model<PollDocument>) {
        // do nothing
    }
    async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
        this.logger.debug('Creating new poll in db');

        try {
            const createdPoll = new this.pollModel(createPollDto);

            return await createdPoll.save();

        } catch (e) {

            this.logger.error('Failed to create poll in db', e);

            throw new HttpException('Failed to create poll in db', HttpStatus.BAD_REQUEST);
        }
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
            return this.pollModel.deleteOne({ _id: id }).exec();

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

    // TODO: remove if not needed
    // async find(filter: UpdatePollDto = {}): Promise<Poll[]> {
    //     console.log(await this.pollModel.find(filter).exec());
    //     return await this.pollModel.find(filter).exec();
    // }
    //
    // async findOne(filter: UpdatePollDto = {}): Promise<Poll> {
    //     return await this.pollModel.findOne(filter).exec();
    // }
}
