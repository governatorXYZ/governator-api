import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DummyDataDto } from './passTrough.dtos';
import { SseService } from './sse.service';

@ApiTags('Server Sent Events')
@Controller()
export class SseController {
    constructor(protected sseService: SseService) {
        // do nothing
    }

    @Sse('sse')
    stream(): Observable<Partial<MessageEvent>> {
        return this.sseService.eventStream;
    }

    @Post('sse/publish')
    @ApiOperation({
        description: 'Publishes an event to the event stream',
    })
    @ApiOkResponse({ description: 'Publish an event' })
    publish(@Body() params: MessageEvent): void {
        this.sseService.emit(params);
    }

    // TODO: this is for development only and has to be removed
    @Post('pass-through')
    @ApiOperation({
        description: 'Pass through endpoint for testing',
    })
    @ApiOkResponse({ description: 'Puts input params into event stream', type: DummyDataDto })
    updateStream(@Body() params: DummyDataDto): void {
        // console.log(params);
        // this.eventStream.next(params);
        this.sseService.eventStream.next(params);
    }
}