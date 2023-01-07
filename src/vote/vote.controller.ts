import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VoteMongoService } from './vote.mongo.service';
import { VoteRequestDto, VoteResponseDto, VoteByPollAggregate } from './vote.dto';
import { VoteRequestHandlerService } from './vote.request-handler.service';
import { VoteResultInterceptor } from './vote.result.interceptor';
import { VoteRequestGuard } from './vote.request.guard';

@ApiTags('Vote')
@ApiSecurity('api_key')
@Controller()
export class VoteController {
    constructor(
        protected mongoService: VoteMongoService,
        protected voteRequestHandlerService: VoteRequestHandlerService,
    ) {
        // do nothing
    }

    @UseInterceptors(VoteResultInterceptor)
    @Get('vote/results/count/:poll_id')
    @ApiOperation({ description: 'Fetch votes by poll' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    @ApiOkResponse({ description: 'Returns total count and list of votes for specified poll', type: VoteByPollAggregate })
    async fetchVoteByPollCountAggregate(@Param('poll_id') poll_id) {
        return {
            aggregate: await this.mongoService.fetchVoteByPollCountAggregate(poll_id),
            votes: await this.mongoService.fetchVoteByPoll(poll_id),
        };
    }

    @Get('vote/results/count/:poll_id/:user_id')
    @ApiOperation({ description: 'Fetch votes by poll and user' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    @ApiParam({ name: 'user_id', description: 'Governator user ID' })
    @ApiOkResponse({ description: 'Returns vote count of user', type: Object, isArray: true })
    async fetchVoteByPollAndUserCountAggregate(
        @Param('poll_id') poll_id,
        @Param('user_id') user_id,
    ) {
        return await this.mongoService.fetchVoteByPollAndUserVotePowerAggregate(poll_id, user_id);
    }

    @UseInterceptors(VoteResultInterceptor)
    @Get('vote/results/sum/:poll_id')
    @ApiOperation({ description: 'Fetch votes by poll' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    @ApiOkResponse({ description: 'Returns sum of vote power and list of votes for specified poll', type: VoteByPollAggregate })
    async fetchVoteByPollSumAggregate(@Param('poll_id') poll_id) {
        return {
            aggregate: await this.mongoService.fetchVoteByPollSumAggregate(poll_id),
            votes: await this.mongoService.fetchVoteByPoll(poll_id),
        };
    }

    @Get('vote/results/votes-per-user/count/:poll_id')
    @ApiOperation({ description: 'Fetch votes per user' })
    @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    @ApiOkResponse({ description: 'Total number of votes per user', type: String })
    async fetchVoteUserCount(@Param('poll_id') poll_id) {
        return await this.mongoService.fetchVoteUserCount(poll_id);
    }

    // fetchVoteByPollCountByUserAggregate

    // @Get('vote/results/sum/:poll_id/:user_id')
    // @ApiOperation({ description: 'Fetch votes by poll and user' })
    // @ApiParam({ name: 'poll_id', description: 'Poll ID' })
    // @ApiParam({ name: 'user_id', description: 'Governator user ID' })
    // async fetchVoteByPollAndUserSumAggregate(
    //     @Param('poll_id') poll_id,
    //     @Param('user_id') user_id,
    // ) {
    //     return await this.mongoService.fetchVoteByPollAndUserSumAggregate(poll_id, user_id);
    // }

    @UseGuards(VoteRequestGuard)
    @Post('vote/:poll_id')
    @ApiParam({ name: 'poll_id', description: 'ID of poll to vote on' })
    @ApiOperation({ description: 'Submit a vote' })
    @ApiCreatedResponse({ description: 'Returns vote object and method used (create/update/delete)', type: VoteResponseDto, isArray: true })
    async createVote(@Param('poll_id') poll_id, @Body() voteRequest: VoteRequestDto): Promise<VoteResponseDto[]> {
        return await this.voteRequestHandlerService.validateVoteRequest(poll_id, voteRequest);
    }

}