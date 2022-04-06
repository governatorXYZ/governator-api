import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { PollModule } from '../poll/poll.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
        PollModule,
        UserModule,
    ],
    controllers: [VoteController],
    providers: [VoteMongoService],
})
export class VoteModule {}