import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollMongoService } from './poll.mongo.service';
import { Poll, PollSchema } from './poll.schema';
import { PollController } from './poll.controller';
import { SseModule } from '../sse/sse.module';
import { StrategyModule } from '../web3/strategy/strategy.module';
import { VoteModule } from '../vote/vote.module';
import { PollCreateProducer } from './poll.q.producer.service';
import { PollCreateConsumer } from './poll.q.consumer.service';
import { BullModule } from '@nestjs/bull';
import { Web3Module } from '../web3/web3.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
        SseModule,
        StrategyModule,
        forwardRef(() => VoteModule),
        BullModule.registerQueue(
            {
                name: 'poll-create',
                limiter: {
                    max: 10,
                    duration: 1000,
                },
            },
        ),
        Web3Module,
    ],
    controllers: [PollController],
    providers: [PollMongoService, PollCreateProducer, PollCreateConsumer],
    exports: [PollMongoService],
})
export class PollModule {}