import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class ClientRequestService {
    private readonly logger = new Logger(ClientRequestService.name);
    readonly eventStream: Subject<any>;
    constructor() {
        this.eventStream = new Subject();
    }

    emit(message: MessageEvent): void {
        this.logger.debug('Publishing client request');
        try {
            this.eventStream.next(message);
        } catch (e) {
            this.logger.error('Failed to push to event stream', e);
        }
    }

}