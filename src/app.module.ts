import { Module, CacheModule } from '@nestjs/common';
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
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => (
                {
                    redis: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                        password: configService.get('REDIS_PASSWORD'),
                        username: configService.get('REDIS_USERNAME'),
                    },
                }
            ),
            inject: [ConfigService],
        }),
        PollModule,
        UserModule,
        AccountModule,
        Web3Module,
        VoteModule,
        ClientRequestModule,
        SseModule,
        AuthModule,
        CommunityModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
