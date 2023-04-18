import { Module, CacheModule, NestModule, Inject, MiddlewareConsumer } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { PollModule } from './poll/poll.module';
import { SseModule } from './sse/sse.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';
import { ClientRequestModule } from './client-request/client-request.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Web3Module } from './web3/web3.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommunityModule } from './community/community.module';
import { BullModule } from '@nestjs/bull';
import { PassportModule } from '@nestjs/passport';
import session from 'express-session';
import passport from 'passport';
import RedisStore from 'connect-redis';
import { RedisModule } from './redis/redis.module';
import { REDIS } from './redis/redis.constants';
import Redis from 'ioredis';


const ENV = process.env.NODE_ENV;

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: !ENV ? '.env' : `.env.${ENV}`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'qa')
                    .default('development'),
                API_PORT: Joi.number().default(3000),
                API_GLOBAL_PREFIX: Joi.string().default('api'),
            }),
        }),
        PassportModule.register({ session: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => (
                configService.get('MONGO_LOCAL') === '' ?
                    {
                        uri: `${configService.get('MONGODB_PREFIX')}://${configService.get('MONGODB_USERNAME')}:${configService.get('MONGODB_PASS')}@${configService.get('MONGODB_CLUSTER')}/${configService.get('MONGODB_DATABASE')}`,
                    } :
                    { uri: configService.get('MONGO_LOCAL') }
            ),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRoot({
            ttl: 50,
            limit: 50 * 50,
        }),
        ScheduleModule.forRoot(),
        CacheModule.register({ isGlobal: true }),
        BullModule.forRootAsync({
            imports: [RedisModule],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            useFactory: async (redis: Redis) => (
                {
                    redis: redis,
                }
            ),
            inject: [REDIS],
        }),
        SseModule,
        PollModule,
        UserModule,
        AccountModule,
        Web3Module,
        ClientRequestModule,
        AuthModule,
        CommunityModule,
        VoteModule,
        RedisModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    constructor(
        @Inject(REDIS) private readonly redis: Redis,
        private readonly configService: ConfigService,
    ) {
        // do nothing
    }

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                session({
                    store: new (RedisStore(session))({ client: this.redis, logErrors: true }),
                    saveUninitialized: false,
                    secret: this.configService.get('SESSION_SECRET'),
                    resave: false,
                    cookie: {
                        sameSite: true,
                        httpOnly: true,
                        secure: true,
                        maxAge: 1000 * 60 * 60 * 24,
                    },
                }),
                passport.initialize(),
                passport.session(),
            )
            .forRoutes('*');
    }

    onModuleDestroy() {
        this.redis.disconnect();
    }
}
