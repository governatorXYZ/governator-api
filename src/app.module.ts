import { Module, NestModule, Inject, MiddlewareConsumer } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
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
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect } from 'mongoose';


const ENV = process.env.NODE_ENV;
let mongo: MongoMemoryServer;

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: !ENV ? '.env' : `.env.${ENV}`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('test', 'development', 'production', 'qa')
                    .default('development'),
                API_PORT: Joi.number().default(3000),
                API_GLOBAL_PREFIX: Joi.string().default('api'),
            }),
        }),
        PassportModule.register({ session: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                if (ENV === 'test') {
                    mongo = await MongoMemoryServer.create();
                    const mongoUri = mongo.getUri();
                    return {
                        uri: mongoUri,
                    };
                } else {
                    return (
                        configService.get('MONGO_LOCAL') === '' ?
                            {
                                uri: `${configService.get('MONGODB_PREFIX')}://${configService.get('MONGODB_USERNAME')}:${configService.get('MONGODB_PASS')}@${configService.get('MONGODB_CLUSTER')}/${configService.get('MONGODB_DATABASE')}`,
                            } :
                            { uri: configService.get('MONGO_LOCAL') }
                    );
                }
            },
            inject: [ConfigService],
        }),
        ThrottlerModule.forRoot({
            ttl: 50,
            limit: 50 * 50,
        }),
        ScheduleModule.forRoot(),
        CacheModule.register({ isGlobal: true }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => (
                {
                    redis: {
                        host: configService.get('REDIS_HOST_QUEUE'),
                        port: configService.get('REDIS_PORT_QUEUE'),
                        password: configService.get('REDIS_PASSWORD_QUEUE'),
                        username: configService.get('REDIS_USERNAME_QUEUE'),
                    },
                }
            ),
            inject: [ConfigService],
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
                    store: new RedisStore({ client: this.redis }),
                    saveUninitialized: false,
                    secret: this.configService.get('SESSION_SECRET'),
                    resave: true,
                    cookie: {
                        sameSite: true,
                        httpOnly: true,
                        secure: this.configService.get('NODE_ENV') !== 'development',
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
        if (ENV === 'test') {
            disconnect();
            if (mongo) mongo.stop();
        }
    }
}
