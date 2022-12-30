import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollMongoService } from './poll.mongo.service';
import { Poll, PollSchema } from './poll.schema';
import { PollController } from './poll.controller';
import { SseModule } from '../sse/sse.module';
import { StrategyModule } from '../web3/strategy/strategy.module';
import { VoteModule } from '../vote/vote.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
        SseModule,
        StrategyModule,
        forwardRef(() => VoteModule),
    ],
    controllers: [PollController],
    providers: [PollMongoService],
    exports: [PollMongoService],
})
export class PollModule {}