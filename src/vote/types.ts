import { VoteRawResponseDto } from './vote.dto';

export interface VoteRawResponseUpdate {
    oldVote: VoteRawResponseDto,
    updatedVote: VoteRawResponseDto,
}
