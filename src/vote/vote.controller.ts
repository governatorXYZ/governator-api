import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VoteMongoService } from './vote.mongo.service';
import { VoteRequestDto, VoteResponseDto } from './vote.dto';

@ApiTags('Vote')
@ApiSecurity('api_key')
@Controller()
export class VoteController {
    constructor(protected mongoService: VoteMongoService) {
        // do nothing
    }
    // TODO revisit and see if better split up into create update delete
    @Post('vote/:poll_id')
    @ApiParam({ name: 'poll_id', description: 'ID of poll to vote on' })
    @ApiOperation({ description: 'Submit a vote' })
    @ApiCreatedResponse({ description: 'Returns vote object and method used (create/update/delete)', type: VoteResponseDto })
    async createVote(@Param('poll_id') poll_id, @Body() voteRequest: VoteRequestDto): Promise<VoteResponseDto> {
        return await this.mongoService.validateVoteRequest(poll_id, voteRequest);
    }

    @Get('vote/results/:poll_id')
    @ApiOperation({ description: 'Fetch votes by poll' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    async fetchVoteByPoll(@Param('poll_id') poll_id) {
        return await this.mongoService.fetchVoteByPoll(poll_id);
    }

    @Get('vote/results/:poll_id/:user_id')
    @ApiOperation({ description: 'Fetch votes by poll and user' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    @ApiParam({ name: 'user_id', description: 'Governator user ID' })
    async fetchVoteByPollAndUser(
        @Param('poll_id') poll_id,
        @Param('user_id') user_id,
    ) {
        return await this.mongoService.fetchVoteByPollAndUser(poll_id, user_id);
    }

}

// TODO add vote get endpoints for result display