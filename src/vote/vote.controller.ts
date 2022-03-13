import {
    Body,
    Controller, Delete,
    Get,
    Param,
    Post, Put,
} from '@nestjs/common';
import {ApiCreatedResponse, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { CreatePollDto } from '../poll/poll.dtos';
import { VoteMongoService } from './vote.mongo.service';

@ApiTags('Vote')
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