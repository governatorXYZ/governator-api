import { Controller, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SseService } from './sse.service';
import { ApiKeyAuthGuard } from '../auth/api-key/api-key.guard';

@ApiTags('Server Sent Events')
@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api_key')
@Controller()
export class SseController {
    constructor(protected sseService: SseService) {
        // do nothing
    }

    @Sse('sse')
    stream(): Observable<Partial<MessageEvent>> {
        return this.sseService.observable;
    }

    // @Post('sse/publish')
    // @ApiOperation({
    //     description: 'Publishes an event to the event stream',
    // })
    // @ApiOkResponse({ description: 'Publish an event' })
    // publish(@Body() params: MessageEvent): void {
    //     this.sseService.emit(params);
    // }
}