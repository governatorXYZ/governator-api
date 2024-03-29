import { Module } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from './redis.constants';

@Module({
    providers: [
        {
            provide: REDIS,
            useValue: new Redis(process.env.REDIS_URL),
        },
    ],
    exports: [REDIS],
})
export class RedisModule {}