import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Vote, VoteDocument } from './vote.schema';
import { VoteCreateDto, VoteRawResponseDto, VoteResponseDto } from './vote.dtos';
import { VoteRawResponseUpdate } from './types';
import { UserService } from '../user/user.service';
import { ethers } from 'ethers';
import constants from '../common/constants';


@Injectable()
export class VoteMongoService {
    private readonly logger = new Logger(VoteMongoService.name);

    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        protected userService: UserService,
    ) {
        // do nothing
    }

    async createVote(voteCreateDto: VoteCreateDto): Promise<VoteResponseDto> {
        this.logger.debug('Creating vote in db');

        try {
            const result: VoteRawResponseDto = await this.voteModel.create(voteCreateDto);
            return this.transformResult('create', result);

        } catch (e) {
            this.logger.error('Failed to create vote in db', e);

            throw new HttpException('Failed to create vote in db', HttpStatus.BAD_REQUEST);
        }
    }

    async updateVote(voteCreateDto: VoteCreateDto): Promise<VoteResponseDto> {

        this.logger.debug('Updating vote in db');

        try {
            const oldVote = await this.voteModel.findOne(
                {
                    poll_id: voteCreateDto.poll_id,
                    account_id: voteCreateDto.account_id,
                }).exec();
            const updated: VoteRawResponseDto = await this.voteModel.findOneAndUpdate(
                {
                    poll_id: voteCreateDto.poll_id,
                    account_id: voteCreateDto.account_id,
                },
                voteCreateDto,
                { new: true }).exec();

            const result = { oldVote: oldVote, updatedVote: updated };

            return this.transformResult('update', result);

        } catch (e) {
            this.logger.error('Failed to update db', e);

            throw new HttpException('Failed to update db', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteVote(voteCreateDto: VoteCreateDto): Promise<VoteResponseDto> {
        this.logger.debug('Deleting vote from db');

        try {
            const result: VoteRawResponseDto = await this.voteModel.findOneAndDelete(voteCreateDto).exec();

            if (process.env.NODE_ENV === 'development') this.logger.debug(`found vote to DELETE: ${JSON.stringify(result)}`);

            return this.transformResult('delete', result);

        } catch (e) {

            this.logger.error('Failed to delete from db', e);

            throw new HttpException('Failed to delete from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchVoteByPoll(pollId) {
        try {
            return await this.voteModel.find({ poll_id: pollId }, '-account_id -__v').exec();

        } catch (e) {
            this.logger.error('Failed to fetch votes from db', e);

            throw new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchVoteByAccount(pollId, accountId): Promise<Array<VoteRawResponseDto>> {

        try {
            return await this.voteModel.find({ poll_id: pollId, account_id: accountId }).lean().exec();

        } catch (e) {
            this.logger.error('Failed to fetch vote from db', e);
        }
    }

    async fetchVoteByPollCountAggregate(pollId) {
        try {
            return await this.voteModel.aggregate([
                { '$match': { 'poll_id': pollId } },
                { '$group': { '_id': '$poll_option_id', count:{ $sum:1 } } },
            ]).exec();

        } catch (e) {
            this.logger.error('Failed to fetch votes from db', e);

            throw new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchVoteUserCount(pollId) {
        this.logger.log('counting votes per user');

        const voteUsers = [];
        try{
            const allVotes = await this.voteModel.find({ poll_id: pollId }).exec();

            for (const vote of allVotes) {

                const user = await this.userService.fetchUserByProvider(vote.provider_id, vote.account_id);

                if(!(voteUsers.includes(JSON.stringify({ [user._id]: vote.poll_option_id })))) voteUsers.push(JSON.stringify({ [user._id]: vote.poll_option_id }));
            }

        } catch (e) {
            this.logger.error('Failed to fetch vote user count from db', e);

            throw new HttpException('Failed to fetch vote user count from db', HttpStatus.BAD_REQUEST);
        }

        this.logger.debug(voteUsers);
        return voteUsers.length;
    }

    async fetchVoteByPollAndUserVotePowerAggregate(pollId, userId) {
        const user = await this.userService.fetchUserById(userId);

        const accountIds = [];
        for (const account of user.provider_accounts) {
            accountIds.push(account._id);
        }

        try {
            return await this.voteModel.aggregate([
                { '$match': { 'poll_id': pollId, 'provider_id': { $in: Array.from(constants.PROVIDERS.keys()) }, 'account_id': { $in: accountIds } } },
                { '$group': { '_id': '$poll_option_id', vote_power: { $push: '$vote_power' } } },
                // { '$group': { '_id': '$poll_option_id', count:{ $sum:1 } } },
            ]).exec();

        }catch (e) {
            this.logger.error('Failed to fetch votes from db', e);

            throw new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST);
        }
    }

    async fetchVoteByPollSumAggregate(pollId) {

        const votePowers = await this.voteModel.aggregate([
            { '$match': { 'poll_id': pollId } },
            { '$group': { '_id': '$poll_option_id', vote_power: { $push: '$vote_power' } } },
        ]).exec();

        if (process.env.NODE_ENV === 'development') this.logger.debug(`votePowers aggregate: \n${JSON.stringify(votePowers)}`);

        const sumVotePowers = votePowers.map((poll_option) => {
            let sum = ethers.BigNumber.from('0');
            for (const value of poll_option.vote_power) {
                sum = sum.add(ethers.BigNumber.from(value));
            }
            return { _id: poll_option._id, vote_power: sum.toString() };
        });

        if (process.env.NODE_ENV === 'development') this.logger.debug(`sumVotePowers: \n${JSON.stringify(sumVotePowers)}`);

        let totalVotePower = ethers.BigNumber.from('0');
        for (const poll_option of sumVotePowers) {
            totalVotePower = totalVotePower.add(ethers.BigNumber.from(poll_option.vote_power));
        }

        const sumVotePowersWithPercentages = sumVotePowers.map((poll_option) => {

            const percent = Math.round(100.0 / parseFloat(ethers.utils.formatEther(totalVotePower)) * parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(poll_option.vote_power))));
            poll_option['percent'] = percent.toString();
            return poll_option;
        });

        return sumVotePowersWithPercentages;

        // sum = ethers.BigNumber.from('0');
        // votes.forEach((vote) => {
        //     vote.
        // })
    }

    transformResult(method: string, data: VoteRawResponseDto | VoteRawResponseUpdate): VoteResponseDto {
        return { method: method, data: data } as VoteResponseDto;
    }

    // async fetchVoteByPollAndUserSumAggregate(pollId, userId) {
    //     try {
    //         return await this.voteModel.aggregate([
    //             { '$match': { 'poll_id': pollId, 'user_id': userId } },
    //             { '$group': { '_id': '$poll_option_id', count:{ $sum: { $toLong: '$vote_power' } } } },
    //         ]).exec();
    //
    //     }catch (e) {
    //         this.logger.error('Failed to fetch votes from db', e);
    //
    //         throw new HttpException('Failed to fetch votes from db', HttpStatus.BAD_REQUEST);
    //     }
    // }

    // TODO: maybe place this part in separate file / service
    // FIXME: BE should handle strategy queries to avoid vote power manipulation by client (or at least validate it) => vote request controller refactor
    // below methods are handling vote logic and should not be accessed by other public endpoints

    // async validateVoteRequest(pollId: string, voteRequestDto: VoteRequestDto) {
    //
    //     if (process.env.NODE_ENV === 'development') this.logger.log(`Attempting to validate vote request for pollID: ${pollId}, with request body: ${JSON.stringify(voteRequestDto)}`);
    //
    //     this.logger.debug('Validating Poll ID');
    //     const poll = await this.getPoll(pollId);
    //     if (!poll) throw new HttpException('Poll not found', HttpStatus.CONFLICT);
    //     this.logger.debug('Poll ID is valid');
    //
    //     this.logger.debug('Validating User account');
    //     const user = await this.getUser(voteRequestDto);
    //     if (!user) throw new HttpException('User not found', HttpStatus.CONFLICT);
    //     this.logger.debug('User ID is valid');
    //
    //     this.logger.debug('Checking if account has already voted on this poll');
    //     const accountVotes = await this.getAccountVotes(pollId, voteRequestDto.account_id);
    //     if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] length: ${Object.keys(accountVotes).length}`);
    //     if (process.env.NODE_ENV === 'development') this.logger.debug(`accountVotes: Vote[] ${JSON.stringify(accountVotes)}`);
    //
    //     this.logger.debug('Checking if vote power is bigger than 0');
    //     if (Number(voteRequestDto.vote_power) <= 0) throw new HttpException('Vote power has to be bigger than 0', HttpStatus.CONFLICT);
    //
    //     this.logger.debug('Preparing voteCreateDto');
    //     const voteCreateDto: VoteCreateDto = { ...voteRequestDto, poll_id: pollId };
    //     if (process.env.NODE_ENV === 'development') this.logger.debug(`voteCreateDto: VoteCreateDto: ${JSON.stringify(voteCreateDto)}`);
    //
    //     if(accountVotes.length === 0) {
    //         this.logger.debug('first time vote of user/platform on this poll');
    //         return await this.createVote(voteCreateDto);
    //     }
    //
    //     const isDuplicate = this.isDuplicateVote(accountVotes, voteCreateDto);
    //
    //     if(accountVotes.length > 0) {
    //         this.logger.debug('not a first-time vote, user/platform has voted on this poll before');
    //
    //         if (isDuplicate) return this.deleteVote(voteCreateDto);
    //
    //         if (!isDuplicate) {
    //             // poll is single vote type --> update vote
    //             if (poll.single_vote) return this.updateVote(voteCreateDto);
    //
    //             // poll is multi vote type --> create vote
    //             if (!poll.single_vote) {
    //                 // TODO: implement multiple options voting for token voting
    //                 if (poll.strategy_config.some(strategyConf => strategyConf.strategy_type === strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED)) {
    //                     this.logger.debug('multiple vote options not yet supported on token weighted strategies');
    //
    //                 } else {
    //                     return await this.createVote(voteCreateDto);
    //
    //                 }
    //             }
    //         }
    //     }
    // }
    //
    // isDuplicateVote(accountVotes: VoteRawResponseDto[], voteCreateDto: VoteCreateDto): boolean {
    //     const voteOptions: string[] = [];
    //     accountVotes.map((vote) => voteOptions.push(vote.poll_option_id));
    //     this.logger.debug('checking if vote is a duplicate');
    //     if (process.env.NODE_ENV === 'development') this.logger.debug(`IsDuplicateVote ${voteOptions} ; ${voteCreateDto.poll_option_id} --> ${voteOptions.includes(voteCreateDto.poll_option_id)}`);
    //     return voteOptions.includes(voteCreateDto.poll_option_id);
    // }

    // async getPoll(pollId): Promise<Poll> {
    //     try {
    //         const poll = await this.pollModel.findById(pollId).exec();
    //         this.logger.debug('POLL found ', poll);
    //         return poll;
    //
    //     } catch (e) {
    //         this.logger.error('Invalid Poll ID', e);
    //
    //         throw new HttpException('Invalid Poll ID', HttpStatus.CONFLICT);
    //     }
    // }
    //
    // async getUser(voteRequestDto: VoteRequestDto): Promise<UserResponseDto> {
    //     try {
    //         const user = await this.userService.fetchUserByProvider(voteRequestDto.provider_id, voteRequestDto.account_id);
    //         this.logger.debug('USER found ', user);
    //         return user;
    //
    //     } catch (e) {
    //         this.logger.error('Invalid User ID', e);
    //
    //         throw new HttpException('Invalid User ID', HttpStatus.CONFLICT);
    //     }
    // }

    // async getUserVotes(pollId, user: UserResponseDto): Promise<Array<VoteRawResponseDto>> {
    //     const accountIds = user.provider_accounts.map((account) => account._id);
    //
    //     this.logger.debug(accountIds);
    //
    //     const votes: Vote[] = [];
    //
    //     for (const accountId of accountIds) {
    //         try {
    //             const vote = await this.voteModel.find({ poll_id: pollId, account_id: accountId }).lean().exec();
    //
    //             if (vote.length > 0) votes.push(...vote);
    //
    //         } catch (e) {
    //             this.logger.error('Failed to fetch vote from db', e);
    //         }
    //     }
    //
    //     return votes;
    //
    // }

}
