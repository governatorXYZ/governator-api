import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';
import { PollModule } from '../poll/poll.module';
import { UserModule } from '../user/user.module';
import { VoteRequestHandlerService } from './vote.request-handler.service';
import { StrategyModule } from '../web3/strategy/strategy.module';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
        forwardRef(() => PollModule),
        BullModule.registerQueue(
            {
                name: 'vote-create',
                limiter: {
                    max: 2,
                    duration: 1000,
                },
            },
        ),
        UserModule,
        StrategyModule,
    ],
    controllers: [VoteController],
    providers: [VoteMongoService, VoteRequestHandlerService],
    exports: [VoteRequestHandlerService],
})
export class VoteModule {}