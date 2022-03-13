import {
    Body,
    Controller, Delete,
    Get,
    Param,
    Post, Put,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreatePollDto } from '../dtos/poll.dtos';
import { VoteMongoService } from '../services/vote.mongo.service';

@Controller()
export class VoteController {
    constructor(protected mongoService: VoteMongoService) {
        // do nothing
    }

    // // @eslint-ignore
    // @Post('vote/create')
    // @ApiOperation({ description: 'Create a new poll' })
    // @ApiCreatedResponse({ description: 'The record has been successfully created.', type: CreatePollDto })
    // async createPoll(@Body() params: CreatePollDto): Promise<void> {
    //     await this.mongoService.createVote(params);
    // }
}