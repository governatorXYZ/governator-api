import { Body, Controller, Delete, Get, Param, Post, Put, MessageEvent } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PollCreateDto, PollUpdateDto } from './poll.dtos';
import { PollMongoService } from './poll.mongo.service';
import { Poll } from './poll.schema';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';

@ApiTags('Poll')
@ApiSecurity('api_key')
@Controller()
export class PollController {
    constructor(
        protected mongoService: PollMongoService,
        protected sseService: SseService,
    ) {
        // do nothing
    }

    @Get('poll/list')
    @ApiOperation({ description: 'Fetch all polls' })
    async fetchAllPolls() {
        return await this.mongoService.fetchAllPolls();
    }

    @Get('poll/:id')
    @ApiOperation({ description: 'Fetch poll by ID' })
    @ApiParam({ name: 'id', description: 'Get poll by ID' })
    async fetchPollById(@Param('id') id) {
        return await this.mongoService.fetchPollById(id);
    }

    @Get('poll/user/:author_user_id')
    @ApiOperation({ description: 'Fetch polls by author' })
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    async fetchPollByUser(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUser(author_user_id);
    }

    @Get('poll/user/:author_user_id/active')
    @ApiOperation({ description: 'Fetch acive polls by author' })
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    async fetchPollByUserOngoing(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUserOngoing(author_user_id);
    }

    @Post('poll/create')
    @ApiOperation({ description: 'Create a new poll' })
    @ApiCreatedResponse({ description: `Returns the created poll object and emits ${constants.EVENT_POLL_CREATE} event`, type: PollCreateDto })
    async createPoll(@Body() params: PollCreateDto): Promise<Poll> {
        const poll = await this.mongoService.createPoll(params);
        await this.sseService.emit({
            data: poll,
            type: constants.EVENT_POLL_CREATE,
        } as MessageEvent);
        return poll;
    }

    @Put('poll/update/:id')
    @ApiParam({ name: 'id', description: 'ID of poll to be updated' })
    @ApiCreatedResponse({ description: `Returns the updated poll object and emits ${constants.EVENT_POLL_UPDATE} event`, type: PollCreateDto })
    async updatePoll(@Param('id') id, @Body() poll: PollUpdateDto): Promise<Poll> {
        const updatePoll = await this.mongoService.updatePoll(id, poll);
        await this.sseService.emit({
            data: updatePoll,
            type: constants.EVENT_POLL_UPDATE,
        } as MessageEvent);
        return updatePoll;
    }

    @Delete('poll/delete/:id')
    @ApiParam({ name: 'id', description: 'ID of poll to be deleted' })
    @ApiCreatedResponse({ description: `Returns the deleted poll object and emits ${constants.EVENT_POLL_DELETE} event`, type: PollCreateDto })
    async deletePoll(@Param('id') id): Promise<Poll> {
        const deletePoll = await this.mongoService.deletePoll(id);
        await this.sseService.emit({
            data: deletePoll,
            type: constants.EVENT_POLL_DELETE,
        } as MessageEvent);
        return deletePoll;
    }
}