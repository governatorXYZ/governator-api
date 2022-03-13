import {
    Body,
    Controller, Delete,
    Get,
    Param,
    Post, Put,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreatePollDto, UpdatePollDto } from './poll.dtos';
import { PollMongoService } from './poll.mongo.service';

@ApiTags('Poll')
@Controller()
export class PollController {
    constructor(protected mongoService: PollMongoService) {
        // do nothing
    }

    // @eslint-ignore
    @Post('poll/create')
    @ApiOperation({ description: 'Create a new poll' })
    @ApiCreatedResponse({ description: 'The record has been successfully created.', type: CreatePollDto })
    async createPoll(@Body() params: CreatePollDto): Promise<void> {
        await this.mongoService.createPoll(params);
    }

    @Get('poll/list')
    async fetchAllPolls() {
        return await this.mongoService.fetchAllPolls();
    }

    @Get('poll/:id')
    @ApiParam({ name: 'id', description: 'Get poll by ID' })
    async fetchPollById(@Param('id') id) {
        return await this.mongoService.fetchPollById(id);
    }

    @Put('poll/update/:id')
    @ApiParam({ name: 'id', description: 'ID of poll to be updated' })
    async updatePoll(@Param('id') id, @Body() poll: UpdatePollDto) {
        return await this.mongoService.updatePoll(id, poll);
    }

    @Get('poll/user/:author_user_id')
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    async fetchPollByUser(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUser(author_user_id);
    }

    @Get('poll/user/:author_user_id/ongoing')
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    async fetchPollByUserOngoing(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUserOngoing(author_user_id);
    }

    @Delete('poll/delete/:id')
    @ApiParam({ name: 'id', description: 'ID of poll to be deleted' })
    async deletePoll(@Param('id') id) {
        return await this.mongoService.deletePoll(id);
    }

    // // @eslint-ignore
    // @Post('find-one-poll')
    // @ApiOperation({ description: 'Retrieve a poll by filter' })
    // @ApiOkResponse({ description: 'Successfully returned poll object', type: UpdatePollDto })
    // async findOne(
    //     @Body() params: UpdatePollDto,
    // ): Promise<any> {
    //     return await this.mongoService.findOne(params);
    // }
    //
    // // @eslint-ignore
    // @Post('find-many-poll')
    // @ApiOperation({ description: 'Retrieve a poll by filter' })
    // @ApiOkResponse({ description: 'Successfully returned poll object', type: UpdatePollDto })
    // async find(
    //     @Body() params: UpdatePollDto,
    // ): Promise<any> {
    //     return await this.mongoService.find(params);
    // }


}