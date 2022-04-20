import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { PollModule } from './poll/poll.module';
import { SseModule } from './sse/sse.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';
import { ClientRequestModule } from './client-request/client-request.module';
import { AuthModule } from './auth/auth.modute';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test')
                    .default('development'),
                LQS_PORT: Joi.number().default(3000),
                LQS_GLOBAL_PREFIX: Joi.string().default('api'),
                API_CORS_ORIGIN: Joi.string().default('false'),
            }),
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: `${configService.get('MONGODB_PREFIX')}://${configService.get('MONGODB_USERNAME')}:${configService.get('MONGODB_PASS')}@${configService.get('MONGODB_CLUSTER')}/governator`,
            }),
            inject: [ConfigService],
        }),
        AccountModule,
        PollModule,
        SseModule,
        UserModule,
        VoteModule,
        ClientRequestModule,
        AuthModule,
    ],
})
export class AppModule {}
