import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    readonly eventStream: Subject<any>;
    constructor() {
        this.eventStream = new Subject();
    }

    emit(event: MessageEvent): void {
        this.logger.debug(`Publishing event ${event.type}`);
        try {
            this.eventStream.next(event);
        } catch (e) {
            this.logger.error('Failed to publish event', e);
        }
    }

}