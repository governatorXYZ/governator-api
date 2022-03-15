import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { PollMongoService } from '../poll/poll.mongo.service';
import { Poll, PollSchema } from '../poll/poll.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    ],
    controllers: [VoteController],
    providers: [VoteMongoService, PollMongoService],
})
export class VoteModule {}