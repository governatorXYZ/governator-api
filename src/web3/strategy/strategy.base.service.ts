import { Injectable, Logger } from '@nestjs/common';
import { EvmService } from '../token-vote/evm/evm.service';
import { SnapshotService } from '../token-vote/snapshot/snapshot.service';
import { TokenWhitelistMongoService } from '../token-vote/token-whitelist/token-whitelist.mongo.service';
import { GraphqlService } from '../token-vote/graphql/graphql.service';
import { UserService } from '../../user/user.service';
import { StrategyRequestDto } from './strategy.dtos';
import * as ethers from 'ethers';

@Injectable()
export class StrategyBaseService {
    readonly logger = new Logger(StrategyBaseService.name);
    constructor(
        protected tokenVoteService: EvmService,
        protected snapshotService: SnapshotService,
        protected tokenWhitelistService: TokenWhitelistMongoService,
        protected graphqlService: GraphqlService,
        protected userService: UserService,
    ) {
        // do nothing.
    }

    async runStrategy(
        params: StrategyRequestDto,
        strategy,
        resultTransformer,
    ): Promise<any> {
        const user = await this.userService.fetchUserById(params.user_id);

        const strategyResult = await strategy(
            user,
            params.block_height ?? null,
            this.tokenVoteService,
            this.snapshotService,
            this.graphqlService,
            this.logger,
            this.tokenWhitelistService,
        );

        return resultTransformer(
            strategyResult,
            this.logger,
            ethers,
        );
    }
}
