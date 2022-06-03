import { Module } from '@nestjs/common';
import { SiweModule } from './siwe/siwe.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { TokenVoteModule } from './token-vote/token-vote.module';

@Module({
    imports: [SiweModule, TokenVoteModule, SnapshotModule],
})
export class Web3Module {}