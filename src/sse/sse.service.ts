import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import constants from '../common/constants';

@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    private readonly eventStream: Subject<any>;
    readonly observable: Observable<any>;

    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCron() {
        this.emit({
            data: {},
            type: constants.EVENT_HEARTBEAT,
        } as MessageEvent);
    }

    constructor() {
        this.eventStream = new Subject();
        this.observable = this.eventStream.asObservable();
    }

    emit(event: MessageEvent): void {
        if (!(event.type === constants.EVENT_HEARTBEAT)) this.logger.debug(`Publishing event ${event.type}`);

        try {
            this.eventStream.next(event);
        } catch (e) {
            this.logger.error('Failed to publish event', e);
        }
    }

}