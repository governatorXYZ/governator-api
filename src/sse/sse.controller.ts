import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SseService } from './sse.service';

@ApiTags('Server Sent Events')
@ApiSecurity('api_key')
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
}