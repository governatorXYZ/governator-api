import { Module } from '@nestjs/common';
import { PollController } from '../poll/poll.controller';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Poll, PollSchema } from '../poll/poll.schema';
import { PollMongoService } from '../poll/poll.mongo.service';
import { SseController } from '../sse/sse.controller';
import { VoteController } from '../vote/vote.controller';
import { VoteMongoService } from '../vote/vote.mongo.service';
import { Vote, VoteSchema } from '../vote/vote.schema';
import { User, UserSchema } from '../user/user.schema';
import { UserMongoService } from '../user/user.mongo.service';
import { AccountMongoService } from '../account/account.mongo.service';
import { Account, AccountSchema } from '../account/account.schema';

@Module({
    imports: [

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
