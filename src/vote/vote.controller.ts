import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { VoteMongoService } from './vote.mongo.service';
import { VoteRequestDto, VoteResponseDto } from './vote.dto';

@ApiTags('Vote')
@Controller()
export class VoteController {
    constructor(protected mongoService: VoteMongoService) {
        // do nothing
    }

    @Post('vote/:poll_id')
    @ApiParam({ name: 'poll_id', description: 'ID of poll to vote on' })
    @ApiOperation({ description: 'Submit a vote' })
    @ApiCreatedResponse({ description: 'Returns vote object and method used (create/update/delete)', type: VoteResponseDto })
    async createVote(@Param('poll_id') poll_id, @Body() voteRequest: VoteRequestDto): Promise<VoteResponseDto> {
        return await this.mongoService.validateVoteRequest(poll_id, voteRequest);
    }

}