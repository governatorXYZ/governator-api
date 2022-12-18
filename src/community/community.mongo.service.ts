import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Community, CommunityDocument } from './community.schema';
import { CommunityCreateDto, CommunityUpdateDto } from './community.dtos';

@Injectable()
export class CommunityMongoService {
    private readonly logger = new Logger(CommunityMongoService.name);

    constructor(
        @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    ) {
        // do nothing
    }

    async createCommunity(communityCreateDto: CommunityCreateDto): Promise<Community> {
        this.logger.log('Creating new community in db');

        try {

            return await this.communityModel.create(communityCreateDto);

        } catch (e) {

            this.logger.error('Failed to create community in db', e);

            throw new HttpException('Failed to create community in db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fetchAllCommunities(): Promise<Community[]> {
        try {
            return await this.communityModel.find().exec();

        } catch (e) {
            this.logger.error('Failed to fetch communities from db', e);

            throw new HttpException('Failed to fetch communities from db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fetchCommunityById(id: string): Promise<Community> {
        try {
            return await this.communityModel.findById(id).exec();

        } catch (e) {
            this.logger.error('Failed to fetch community from db', e);

            throw new HttpException('Failed to fetch community from db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCommunity(id: string, communityUpdateDto: CommunityUpdateDto): Promise<Community> {
        try {
            return this.communityModel.findByIdAndUpdate(id, communityUpdateDto, { new: true }).exec();

        } catch (e) {
            this.logger.error('Failed to update community in db', e);

            throw new HttpException('Failed to update community in db', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async deleteCommunity(id: string): Promise<Community> {
        try {
            return this.communityModel.findOneAndDelete({ _id: id }).exec();

        } catch (e) {
            this.logger.error('Failed to delete community from db', e);

            throw new HttpException('Failed to delete community from db', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
