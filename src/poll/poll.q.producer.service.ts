import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PollCreateDto } from './poll.dtos';
 
@Injectable()
export class PollCreateProducer {
    constructor(@InjectQueue('poll-create') private queue: Queue) {
        // do nothing
    }
 
    async pollCreateJob(poll: PollCreateDto) {
        return await this.queue.add(poll);
    }
}