import {
    Body,
    Controller,
    MessageEvent, Post,
    Sse,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DummyDataDto } from './passTrough.dtos';

@ApiTags('Server Sent Events')
@Controller()
export class SseController {
    private readonly eventStream: Subject<any>;
    constructor() {
        this.eventStream = new Subject();
    }

    @Sse('sse')
    stream(): Observable<Partial<MessageEvent>> {
        return this.eventStream;
    }

    // TODO: this is for development only and has to be removed
    // @eslint-ignore
    @Post('pass-through')
    @ApiOperation({
        description: 'Pass through endpoint for testing',
    })
    @ApiOkResponse({ description: 'Puts input params into event stream', type: DummyDataDto })
    updateStream(@Body() params: DummyDataDto): void {
        // console.log(params);
        this.eventStream.next(params);
    }
}