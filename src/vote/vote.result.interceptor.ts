import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PollMongoService } from '../poll/poll.mongo.service';

interface Response {
    aggregate: [],
    votes: []
}

@Injectable()
export class VoteResultInterceptor<T> implements NestInterceptor<T, Response> {
    private readonly logger = new Logger(VoteResultInterceptor.name);

    constructor(
        private pollService: PollMongoService,
    ) {
        // do nothing
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Response>> {
        const poll = await this.pollService.fetchPollById(context.getArgs()[0].params.poll_id);
        const now = new Date(Date.now());
        return next.handle().pipe(map((result) => {
            if (poll.end_time >= now) {
                this.logger.warn(`Result response intercepted: Poll ${poll._id} still active at ${now.toISOString()}`);
                return { aggregate: [], votes: [] };
            } else {
                return result;
            }
        }));
    }
}