import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoModule } from './mongo.module';

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
        MongoModule,
    ],
})
export class AppModule {}
