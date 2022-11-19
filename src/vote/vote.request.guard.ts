import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { PollMongoService } from '../poll/poll.mongo.service';

@Injectable()
export class VoteRequestGuard implements CanActivate {
    private readonly logger = new Logger(VoteRequestGuard.name);

    constructor(
        private pollService: PollMongoService,
    ) {
        // do nothing
    }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        // const request = context.switchToHttp().getRequest();
        return this.validateRequest(context);
    }

    validateRequest = async (context: ExecutionContext) => {
        this.logger.log('vote guard checking request');
        const poll = await this.pollService.fetchPollById(context.getArgs()[0].params.poll_id);
        const now = new Date(Date.now());
        const pass = poll.end_time > now;
        if (!pass) this.logger.warn(`Vote request blocked: Poll ${poll._id} expired at ${now.toISOString()}`);
        return pass;
    };
}

