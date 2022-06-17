import { Module } from '@nestjs/common';
import { EvmModule } from './evm/evm.module';
import { TokenWhitelistModule } from './token-whitelist/token-whitelist.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { AccountModule } from '../../account/account.module';
import { GraphqlModule } from './graphql/graphql.module';


@Module({
    imports: [EvmModule, SnapshotModule, TokenWhitelistModule, GraphqlModule, AccountModule],
    exports: [EvmModule, SnapshotModule, TokenWhitelistModule, GraphqlModule],
})
export class TokenVoteModule {}