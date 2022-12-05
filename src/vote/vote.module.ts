import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { PollModule } from '../poll/poll.module';
import { UserModule } from '../user/user.module';
import { VoteRequestHandlerService } from './vote.request-handler.service';
import { StrategyModule } from '../web3/strategy/strategy.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
        PollModule,
        UserModule,
        StrategyModule,
    ],
    controllers: [VoteController],
    providers: [VoteMongoService, VoteRequestHandlerService],
})
export class VoteModule {}