import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Poll, PollSchema } from './schemas/poll.schema';
import { MongoService } from './services/mongo.service';

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
        // MongooseModule.forRoot(`${process.env.MONGODB_PREFIX}://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}/`),
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    ],
    controllers: [AppController],
    providers: [MongoService],
})
export class AppModule {}
