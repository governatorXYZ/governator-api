import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { VoteRequestDto } from './vote.dtos';
 
@Injectable()
export class VoteCreateProducer {
    constructor(@InjectQueue('vote-create') private queue: Queue) {
        // do nothing
    }
 
    async voteCreateJob(pollId: string, voteRequest: VoteRequestDto): Promise<Bull.Job<{pollId: string, voteRequest: VoteRequestDto}>> {
        return await this.queue.add({
            pollId: pollId,
            voteRequest: voteRequest,
        });
    }
}