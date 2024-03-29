import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StrategySchema, Strategy } from './strategy.schema';
import StrategyControllers from './strategies';
import { StrategyBaseService } from './strategy.base.service';
import { StrategyMongoService } from './strategy.mongo.service';
import { TokenVoteModule } from '../token-vote/token-vote.module';
import { StrategyController } from './strategy.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Strategy.name, schema: StrategySchema }]),
        TokenVoteModule,
    ],
    controllers: [...StrategyControllers, StrategyController],
    providers: [StrategyBaseService, StrategyMongoService],
    exports: [StrategyMongoService],
})
export class StrategyModule {}