import { Body, Controller, Delete, Get, Param, Post, Patch, MessageEvent, Logger } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PollCreateDto, PollUpdateDto, PollResponseDto } from './poll.dtos';
import { PollMongoService } from './poll.mongo.service';
import { Poll } from './poll.schema';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';
import { PollCreateProducer } from './poll.q.producer.service';
import { PollCreateConsumer } from './poll.q.consumer.service';

@ApiTags('Poll')
@ApiSecurity('api_key')
@Controller()
export class PollController {

    private readonly logger = new Logger(PollController.name);

    constructor(
        protected mongoService: PollMongoService,
        protected sseService: SseService,
        private readonly pollCreateProducer: PollCreateProducer,
        private readonly pollCreateConsumer: PollCreateConsumer,
    ) {
        // do nothing
    }

    @Get('poll/list')
    @ApiOperation({ description: 'Fetch all polls' })
    @ApiOkResponse({ description: 'Returns all polls', type: PollResponseDto, isArray: true })
    async fetchAllPolls() {
        return await this.mongoService.fetchAllPolls();
    }

    @Get('poll/:poll_id')
    @ApiOperation({ description: 'Fetch poll by ID' })
    @ApiParam({ name: 'poll_id', description: 'Get poll by ID' })
    @ApiOkResponse({ description: 'Returns poll by poll_id', type: PollResponseDto })
    async fetchPollById(@Param('poll_id') id) {
        return await this.mongoService.fetchPollById(id);
    }

    @Get('poll/user/:author_user_id')
    @ApiOperation({ description: 'Fetch polls by author' })
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    @ApiOkResponse({ description: 'Returns polls by author_user_id', type: PollResponseDto, isArray: true })
    async fetchPollByUser(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUser(author_user_id);
    }

    @Get('poll/user/:author_user_id/active')
    @ApiOperation({ description: 'Fetch active polls by author' })
    @ApiParam({ name: 'author_user_id', description: 'Governator user ID' })
    @ApiOkResponse({ description: 'Returns active polls by author_user_id', type: PollResponseDto, isArray: true })
    async fetchPollByUserOngoing(@Param('author_user_id') author_user_id) {
        return await this.mongoService.fetchPollByUserOngoing(author_user_id);
    }

    @Post('poll/create')
    @ApiOperation({ description: 'Create a new poll' })
    @ApiCreatedResponse({ description: `Returns the created poll object and emits ${constants.EVENT_POLL_CREATE} event`, type: PollResponseDto })
    async createPoll(@Body() params: PollCreateDto): Promise<any> {

        const job = await this.pollCreateProducer.pollCreateJob(params);

        this.logger.log(`PollCreate Job ${job.id} running. Awaiting result..`);

        return this.pollCreateConsumer.getReturnValueFromObservable(job);
    }

    @Patch('poll/update/:poll_id')
    @ApiParam({ name: 'poll_id', description: 'ID of poll to be updated' })
    @ApiCreatedResponse({ description: `Returns the updated poll object and emits ${constants.EVENT_POLL_UPDATE} event`, type: PollResponseDto })
    async updatePoll(@Param('poll_id') id, @Body() poll: PollUpdateDto): Promise<Poll> {
        const updatePoll = await this.mongoService.updatePoll(id, poll);
        this.sseService.emit({
            data: updatePoll,
            type: constants.EVENT_POLL_UPDATE,
        } as MessageEvent);
        return updatePoll;
    }

    @Delete('poll/delete/:poll_id')
    @ApiParam({ name: 'poll_id', description: 'ID of poll to be deleted' })
    @ApiCreatedResponse({ description: `Returns the deleted poll object and emits ${constants.EVENT_POLL_DELETE} event`, type: PollResponseDto })
    async deletePoll(@Param('poll_id') id): Promise<Poll> {
        const deletePoll = await this.mongoService.deletePoll(id);
        this.sseService.emit({
            data: deletePoll,
            type: constants.EVENT_POLL_DELETE,
        } as MessageEvent);
        return deletePoll;
    }
}