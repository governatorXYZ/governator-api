import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CommunityCreateDto, CommunityUpdateDto, CommunityResponseDto } from './community.dtos';
import { CommunityMongoService } from './community.mongo.service';
import { Community } from './community.schema';

@ApiTags('Community')
@ApiSecurity('api_key')
@Controller()
export class CommunityController {
    constructor(
        protected mongoService: CommunityMongoService,
    ) {
        // do nothing
    }

    @Get('community/list')
    @ApiOperation({ description: 'Fetch all communities' })
    @ApiOkResponse({ description: 'Returns the created community object', type: CommunityResponseDto, isArray: true })
    async fetchAllCommunities() {
        return await this.mongoService.fetchAllCommunities();
    }

    @Get('community/:community_id')
    @ApiOperation({ description: 'Fetch community by ID' })
    @ApiParam({ name: 'community_id', description: 'Get community by ID' })
    @ApiOkResponse({ description: 'Returns the created community object', type: CommunityResponseDto })
    async fetchCommunityById(@Param('community_id') id) {
        return await this.mongoService.fetchCommunityById(id);
    }

    @Post('community/create')
    @ApiOperation({ description: 'Create a new community' })
    @ApiCreatedResponse({ description: 'Returns the created community object', type: CommunityResponseDto })
    async createCommunity(@Body() params: CommunityCreateDto): Promise<Community> {
        return await this.mongoService.createCommunity(params);
    }

    @Patch('community/update/:community_id')
    @ApiParam({ name: 'community_id', description: 'ID of community to be updated' })
    @ApiCreatedResponse({ description: 'Returns the updated community object', type: CommunityResponseDto })
    async updateCommunity(@Param('community_id') id, @Body() community: CommunityUpdateDto): Promise<Community> {
        return await this.mongoService.updateCommunity(id, community);
    }

    @Delete('community/delete/:community_id')
    @ApiParam({ name: 'community_id', description: 'ID of community to be deleted' })
    @ApiCreatedResponse({ description: 'Returns the deleted community object', type: CommunityResponseDto })
    async deleteCommunity(@Param('community_id') id): Promise<Community> {
        return await this.mongoService.deleteCommunity(id);
    }
}