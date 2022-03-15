import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from './vote.schema';
import { CreateVoteDto, VoteRequestDto } from './vote.dto';
import { Poll, PollDocument } from '../poll/poll.schema';

@Injectable()
export class VoteMongoService {
    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    ) {
        // do nothing
    }

    // TODO: on bot: check if user is part of role allow list, check reaction allow list
    async validateVoteRequest(pollId: string, voteRequestDto: VoteRequestDto) {

        const providerId = this.getProviderId();

        // check if poll ID is valid
        const poll = await this.getPoll(pollId);

        if(!poll) throw new HttpException('Poll not found, please use a valid poll ID', HttpStatus.CONFLICT);

        // check if user has already voted on this poll with this provider_account
        const userVotes = await this.getVotes(pollId, providerId, voteRequestDto.provider_account_id);

        // prepare createVoteDto
        const createVoteDto: CreateVoteDto = { ...voteRequestDto, poll_id: pollId, provider_id: providerId };

        // if this is first vote on poll -> create vote
        if(userVotes.length === 0) {
            return await this.createVote(createVoteDto);
        }

        // if user has voted before
        if(userVotes.length > 0) {
            // if vote is duplicate --> delete vote
            if (this.isDuplicateVote(userVotes, createVoteDto)) return this.deleteVote(createVoteDto);

            // if vote is not a duplicate
            if (!this.isDuplicateVote(userVotes, createVoteDto)) {
                // poll is single vote type --> update vote
                if (poll.single_vote) return this.updateVote(createVoteDto);

                // poll is multi vote type --> create vote
                if (poll.single_vote) return await this.createVote(createVoteDto);
            }
        }
    }

    // TODO: extend to make provider agnostic and get provider Id from auth module (for MVP it just assumes discord)
    getProviderId() {
        return 'discord';
    }

    async getPoll(pollId): Promise<Poll> {
        return await this.pollModel.findOne({ poll_id: pollId }).exec();
    }

    async getVotes(pollId, providerId, providerAccountId): Promise<Vote[]> {
        return await this.voteModel.find({ poll_id: pollId, provider_id: providerId, provider_account_id: providerAccountId }).exec();
    }

    isDuplicateVote(userVotes, createVoteDto): boolean {
        return userVotes.includes(createVoteDto.poll_option_index);
    }

    async createVote(createVoteDto: CreateVoteDto): Promise<Vote> {
        const createdVote = new this.voteModel(createVoteDto);
        return createdVote.save();
    }

    async updateVote(createVoteDto: CreateVoteDto): Promise<any> {
        // TODO double check that _id will persist in DB
        return this.voteModel.updateOne({
            poll_id: createVoteDto.poll_id,
            provider_id: createVoteDto.provider_id,
            provider_account_id: createVoteDto.provider_account_id
        }, createVoteDto, { new: true }).exec();
    }

    async deleteVote(createVoteDto: CreateVoteDto): Promise<any> {
        return this.voteModel.deleteOne({ createVoteDto }).exec();
    }
}
