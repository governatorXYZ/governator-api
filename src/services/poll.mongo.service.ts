import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from '../schemas/poll.schema';
import { CreatePollDto } from '../dtos/poll.dtos';

@Injectable()
export class PollMongoService {
    constructor(@InjectModel(Poll.name) private pollModel: Model<PollDocument>) {
        // do nothing
    }
    async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
        const createdPoll = new this.pollModel(createPollDto);
        return createdPoll.save();
    }

    async fetchAllPolls(): Promise<Poll[]> {
        return await this.pollModel.find().exec();
    }

    async fetchPollById(id): Promise<Poll> {
        return await this.pollModel.findById(id).exec();
    }

    async updatePoll(id, poll): Promise<Poll> {
        return this.pollModel.findByIdAndUpdate(id, poll, { new: true }).exec();
    }

    async deletePoll(id): Promise<any> {
        return this.pollModel.deleteOne({ _id: id }).exec();
    }

    async fetchPollByUser(user_id): Promise<Poll[]> {
        return this.pollModel.find({ author_user_id: user_id }).exec();
    }

    async fetchPollByUserOngoing(user_id): Promise<Poll[]> {
        return this.pollModel.find({ author_user_id: user_id,
            end_time: {
                $gt:  new Date(Date.now()),
            } }).exec();
    }

    // async find(filter: UpdatePollDto = {}): Promise<Poll[]> {
    //     console.log(await this.pollModel.find(filter).exec());
    //     return await this.pollModel.find(filter).exec();
    // }
    //
    // async findOne(filter: UpdatePollDto = {}): Promise<Poll> {
    //     return await this.pollModel.findOne(filter).exec();
    // }
}
