import { Controller, Get, MessageEvent, Res, Sse } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import {interval, Observable, of, Subject} from 'rxjs';
import { map } from 'rxjs/operators';
import * as cron from 'cron';

const EventSource = require("eventsource");
const eventSourceInitDict = { https: { rejectUnauthorized: false } };

const evtSource = new EventSource(
    'http://localhost:3000/sse', eventSourceInitDict
);

evtSource.onmessage = ({ data, lastEventId }) => {
  console.log('New message', JSON.parse(data), lastEventId);
};

const eventStream = new Subject();

const my_function = function(x) {
  eventStream.next(x);
}

const job3 = new cron.CronJob('0/10 * * * * *', async function() {
  my_function({ data: { hello: Date.now.toString() } });
}, null, true, 'America/Los_Angeles');
job3.start();

// function testFn(data) {
//   return new Observable(function subscribe(subscriber) {
//     subscriber.next(data as MessageEvent);
//   });
// }

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() response: Response) {
    response
      .type('text/html')
      .send(readFileSync(join(__dirname, 'index.html')).toString());
  }

  @Sse('sse')
  publishUpdates(): Observable<Partial<MessageEvent>> {

    return eventStream;
    // return testFn();
    // return of({data: "Hello"}, {data: "world!"})
  // }
  // getHello(): Observable<MessageEvent> {
  //   return new Observable(function subscribe(subscriber) {
  //     subscriber.next({ data: { hello: 'world1' } } as MessageEvent);
  //     subscriber.next({ data: { hello: 'world2' } } as MessageEvent);
  //     subscriber.next({ data: { hello: 'world3' } } as MessageEvent);
  //     // subscriber.complete();
  //     subscriber.next({ data: { hello: 'world' } } as MessageEvent); // Is not delivered because it would violate the contract
  //   });
    // return interval(6000).pipe(
    //   map((_) => ({ data: { hello: 'world' } } as MessageEvent)),
    // );
  }
}

