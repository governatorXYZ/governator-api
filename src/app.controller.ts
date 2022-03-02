import {
    Body,
    Controller,
    Get,
    MessageEvent,
    Param,
    Post, Put,
    Sse,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { DummyDataDto } from './dtos/passTrough.dtos';
import { CreatePollDto, UpdatePollDto } from './dtos/poll.dtos';
import { MongoService } from './services/mongo.service';

// import * as cron from 'cron';

// set cron job to add messages to event stream
// const job3 = new cron.CronJob('0/10 * * * * *',
//     async function() { addToEventStream({ data: { hello: Date.now().toString() } });},
//     null, true, 'America/Los_Angeles',
// );
// job3.start();

@Controller()
export class AppController {
    private readonly eventStream: Subject<any>;
    constructor(protected mongoService: MongoService) {
        this.eventStream = new Subject();
    }

    @Sse('sse')
    stream(): Observable<Partial<MessageEvent>> {
        return this.eventStream;
    }

    // @eslint-ignore
    @Post('pass-through')
    @ApiOperation({
        description: 'Pass through endpoint for testing',
    })
    @ApiOkResponse({ description: 'Puts input params into event stream', type: DummyDataDto })
    updateStream(@Body() params: DummyDataDto): void {
        // console.log(params);
        this.eventStream.next(params);
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

    @Get('poll/user/:author_discord_id')
    @ApiParam({ name: 'author_discord_id', description: 'Discord user ID' })
    async fetchPollByUser(@Param('author_discord_id') author_discord_id) {
        return await this.mongoService.fetchPollByUser(author_discord_id);
    }

    @Get('poll/user/:author_discord_id/ongoing')
    @ApiParam({ name: 'author_discord_id', description: 'Discord user ID' })
    async fetchPollByUserOngoing(@Param('author_discord_id') author_discord_id) {
        return await this.mongoService.fetchPollByUserOngoing(author_discord_id);
    }

    //
    // @Delete('/:id')
    // async delete(@Res() response, @Param('id') id) {
    //     const deletedBook = await this.bookService.delete(id);
    //     return response.status(HttpStatus.OK).json({
    //         deletedBook
    //     })
    // }

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