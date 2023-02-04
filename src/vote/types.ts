import { VoteRawResponseDto } from './vote.dtos';

export interface VoteRawResponseUpdate {
    oldVote: VoteRawResponseDto,
    updatedVote: VoteRawResponseDto,
}
