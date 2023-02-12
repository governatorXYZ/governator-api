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

    async fetchVoteUserCount(pollId: string) {
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
    }

    transformResult(method: string, data: VoteRawResponseDto | VoteRawResponseUpdate): VoteResponseDto {
        return { method: method, data: data } as VoteResponseDto;
    }
}
