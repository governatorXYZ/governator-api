import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from './vote.schema';
import { CreateVoteDto, VoteRawResponseDto, VoteRequestDto, VoteResponseDto } from './vote.dto';
import { Poll, PollDocument } from '../poll/poll.schema';

@Injectable()
export class VoteMongoService {
    private readonly logger = new Logger(VoteMongoService.name);

    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
    ) {
        // do nothing
    }

    // TODO: on bot: check if user is part of role allow list, check reaction allow list
    async validateVoteRequest(pollId: string, voteRequestDto: VoteRequestDto) {

        this.logger.log(`Attempting to validate vote request for pollID: ${pollId}, with request body: ${voteRequestDto}`);

        this.logger.debug('Attempting to retrieve provider_id of vote request provider');
        const providerId = this.getProviderId();

        this.logger.debug('Validating Poll ID');
        const poll = await this.getPoll(pollId);
        this.logger.debug('Poll ID is valid');

        this.logger.debug('Checking if user has already voted on this poll with this provider_account');
        const userVotes = await this.getVotes(pollId, providerId, voteRequestDto.provider_account_id);
        this.logger.debug(`userVotes: Vote[] length: ${Object.keys(userVotes).length}`);
        this.logger.debug(`userVotes: Vote[] length: ${userVotes}`);

        this.logger.debug('Preparing createVoteDto');
        const createVoteDto: CreateVoteDto = { ...voteRequestDto, poll_id: pollId, provider_id: providerId };
        this.logger.debug(`createVoteDto: CreateVoteDto: ${JSON.stringify(createVoteDto)}`);

        if(Object.keys(userVotes).length === 0) {
            this.logger.debug('first time vote of user/platform on this poll');
            return await this.createVote(createVoteDto);
        }

        const isDuplicate = this.isDuplicateVote(userVotes, createVoteDto);

        if(Object.keys(userVotes).length > 0) {
            this.logger.debug('not a first-time vote, user/platform has voted on this poll before');

            if (isDuplicate) return this.deleteVote(createVoteDto);

            if (!isDuplicate) {
                // poll is single vote type --> update vote
                if (poll.single_vote) return this.updateVote(createVoteDto);

                // poll is multi vote type --> create vote
                if (!poll.single_vote) return await this.createVote(createVoteDto);
            }
        }
    }

    isDuplicateVote(userVotes, createVoteDto): boolean {
        const voteOptions: number[] = [];
        userVotes.map((value) => voteOptions.push(value.poll_option_index));
        this.logger.debug('checking if vote is a duplicate');
        this.logger.debug(`IsDuplicateVote ${voteOptions} ; ${createVoteDto.poll_option_index} --> ${voteOptions.includes(createVoteDto.poll_option_index)}`);
        return voteOptions.includes(createVoteDto.poll_option_index);
    }

    transformResult(method: string, data: VoteRawResponseDto): VoteResponseDto {
        return { method: method, data: data } as VoteResponseDto;
    }

    // TODO: extend to make provider agnostic and get provider Id from auth module (for MVP it just assumes discord)
    getProviderId() {
        this.logger.debug(`provider_id: ${'discord'}`);

        return 'discord';
    }

    async getPoll(pollId): Promise<Poll> {
        try {
            return await this.pollModel.findById(pollId).exec();

        } catch (e) {
            this.logger.error('Invalid Poll ID', e);

            throw new HttpException('Invalid Poll ID', HttpStatus.CONFLICT);
        }
    }

    async getVotes(pollId, providerId, providerAccountId): Promise<Record<string, any>> {
        try {
            return await this.voteModel.find({ poll_id: pollId, provider_id: providerId, provider_account_id: providerAccountId }).exec();

        } catch (e) {
            this.logger.error('Failed to fetch votes from db', e);

            throw new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST);
        }
    }

    async createVote(createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {
        this.logger.debug('Creating vote in db');

        const createdVote = new this.voteModel(createVoteDto);

        try {
            const result: VoteRawResponseDto = await createdVote.save();
            return this.transformResult('create', result);

        } catch (e) {
            this.logger.error('Failed to create vote in db', e);

            throw new HttpException('Failed to create vote in db', HttpStatus.BAD_REQUEST);
        }
    }

    async updateVote(createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {

        // TODO double check that _id will persist in DB

        this.logger.debug('Updating vote in db');

        try {
            const result: VoteRawResponseDto = await this.voteModel.findOneAndUpdate(
                {
                    poll_id: createVoteDto.poll_id,
                    provider_id: createVoteDto.provider_id,
                    provider_account_id: createVoteDto.provider_account_id,
                },
                createVoteDto,
                { new: true }).exec();

            return this.transformResult('update', result);

        } catch (e) {
            this.logger.error('Failed to update db', e);

            throw new HttpException('Failed to update db', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteVote(createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {
        this.logger.debug('Deleting vote from db');

        try {
            const result: VoteRawResponseDto = await this.voteModel.findOneAndDelete({ createVoteDto }).exec();

            return this.transformResult('delete', result);

        } catch (e) {

            this.logger.error('Failed to delete from db', e);

            throw new HttpException('Failed to delete from db', HttpStatus.BAD_REQUEST);
        }
    }
}
