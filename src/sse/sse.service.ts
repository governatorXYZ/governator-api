import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
// import { MessageEvent } from './types';

@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    readonly eventStream: Subject<any>;
    constructor() {
        this.eventStream = new Subject();
    }

    emit(message: MessageEvent): void {
        this.logger.debug(`Publishing event ${message.type}`);
        this.eventStream.next(message);
    }

}