import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from './vote.schema';
import {CreateVoteDto, VoteRequestDto} from "./vote.dto";
import {CreatePollDto} from "../poll/poll.dtos";

@Injectable()
export class VoteMongoService {
    constructor(@InjectModel(Vote.name) private voteModel: Model<VoteDocument>) {
        // do nothing
    }

    // TODO: on bot: check if user is part of role allow list, check reaction allow list
    async validateVoteRequest(pollId: string, voteRequestDto: VoteRequestDto) {

        const providerId = this.getProviderId();

        // check if poll ID is valid
        const poll = await this.getPoll(pollId);

        // TODO implement
        if(!poll) { return 'Poll not found'; }

        // check if user has already voted on this poll with this provider_account
        const userVotes = await this.getVotes(providerId, voteRequestDto.provider_account_id);

        // prepare createVoteDto
        const createVoteDto: CreateVoteDto = { ...voteRequestDto, poll_id: pollId, provider_id: providerId };

        // if this is first vote on poll -> create vote
        if(userVotes.length === 0) {
            return await this.createVote(createVoteDto);
        }

        // if user has voted before
        if(userVotes.length > 0) {
            // if vote is duplicate --> delete vote
            if (await this.isDuplicateVote(userVotes, createVoteDto)) return this.deleteVote(createVoteDto);

            // if vote is not a duplicate
            if (! await this.isDuplicateVote(userVotes, createVoteDto)) {
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

    async getPoll(pollId) {
        // TODO implement
        let poll: CreatePollDto;
        return poll;
    }

    async getVotes(providerId, providerAccountId){
        // TODO implement
        return [];
    }

    async isDuplicateVote(userVotes, createVoteDto) {
        // TODO implement, check if ...userVotes.vote_record contains createVoteDto.vote_record
        return false;
    }

    async createVote(createVoteDto: CreateVoteDto): Promise<Vote> {
        const createdVote = new this.voteModel(createVoteDto);
        return createdVote.save();
    }

    async updateVote(createVoteDto: CreateVoteDto): Promise<boolean> {
        // TODO implement
        // const createdVote = new this.voteModel(createVoteDto);
        // return createdVote.save();
        return true;
    }

    async deleteVote(createVoteDto: CreateVoteDto): Promise<boolean> {
        // TODO implement
        // const createdVote = new this.voteModel(createVoteDto);
        // return createdVote.save();
        return true;
    }
}
