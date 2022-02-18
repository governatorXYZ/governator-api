import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid('development', 'production', 'test')
                    .default('development'),
                LQS_PORT: Joi.number().default(3000),
                LQS_GLOBAL_PREFIX: Joi.string().default('governator'),
                API_CORS_ORIGIN: Joi.string().default('false'),
            }),
        }),
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
