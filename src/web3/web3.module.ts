import { Module } from '@nestjs/common';
import { SiweModule } from './siwe/siwe.module';
import { TokenVoteModule } from './token-vote/token-vote.module';
import { StrategyModule } from './strategy/strategy.module';

@Module({
    imports: [SiweModule, TokenVoteModule, StrategyModule],
    exports: [TokenVoteModule],
})
export class Web3Module {}