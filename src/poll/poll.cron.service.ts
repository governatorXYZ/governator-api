import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';

export interface CronJobParameters{
    cronTime: any,
    onTick: any,
    onComplete?: any,
    startNow?: boolean,
    timeZone?: string,
    context?: any,
    runOnInit?: boolean,
    utcOffset?: string | number,
    unrefTimeout?: boolean,
}
 
@Injectable()
export class PollCronService {
    private readonly logger = new Logger(PollCronService.name);

    constructor() {
        // do nothing
    }
 
    newCronJob(params: CronJobParameters) {
        return new CronJob(params.cronTime, params.onTick, params.onComplete, params.startNow, params.timeZone, params.context, params.runOnInit, params.utcOffset, params.unrefTimeout);
    }
}