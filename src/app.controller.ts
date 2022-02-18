import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DummyDataDto } from './app.dtos';
// import * as cron from 'cron';

// set cron job to add messages to event stream
// const job3 = new cron.CronJob('0/10 * * * * *',
//     async function() { addToEventStream({ data: { hello: Date.now().toString() } });},
//     null, true, 'America/Los_Angeles',
// );
// job3.start();

@Controller()
export class AppController {
    private readonly eventStream: Subject<any>;
    constructor() {
        this.eventStream = new Subject();
    }

    @Sse('sse')
    stream(): Observable<Partial<MessageEvent>> {
        return this.eventStream;
    }

    // @eslint-ignore
    @Post('create-poll')
    @ApiOperation({
        description: 'Endpoint to create new poll',
    })
    @ApiOkResponse({ description: 'puts params into event stream', type: DummyDataDto })
    updateStream(@Body() params: DummyDataDto): void {
        // console.log(params);
        this.eventStream.next(params);
    }
}
