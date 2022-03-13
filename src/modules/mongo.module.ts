import { Module } from '@nestjs/common';
import { PollController } from '../controllers/poll.controller';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Poll, PollSchema } from '../schemas/poll.schema';
import { PollMongoService } from '../services/poll.mongo.service';
import { SseController } from '../controllers/sse.controller';
import { VoteController } from '../controllers/vote.controller';
import { VoteMongoService } from '../services/vote.mongo.service';
import { Vote, VoteSchema } from '../schemas/vote.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { UserMongoService } from '../services/user.mongo.service';
import { AccountMongoService } from '../services/account.mongo.service';
import { Account, AccountSchema } from '../schemas/account.schema';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: `${configService.get('MONGODB_PREFIX')}://${configService.get('MONGODB_USERNAME')}:${configService.get('MONGODB_PASS')}@${configService.get('MONGODB_CLUSTER')}/governator`,
            }),
            inject: [ConfigService],
        }),
        // MongooseModule.forRoot(`${process.env.MONGODB_PREFIX}://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}/`),
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),

    ],
    controllers: [
        PollController,
        VoteController,
    ],
    providers: [
        PollMongoService,
        VoteMongoService,
        UserMongoService,
        AccountMongoService,
    ],
})
export class MongoModule {}
