import { Injectable, Logger } from '@nestjs/common';
import { EvmService } from '../token-vote/evm/evm.service';
import { TokenWhitelistMongoService } from '../token-vote/token-whitelist/token-whitelist.mongo.service';
import { GraphqlService } from '../token-vote/graphql/graphql.service';
import { StrategyRequestDto } from './strategy.dtos';
import * as ethers from 'ethers';

@Injectable()
export class StrategyBaseService {
    readonly logger = new Logger(StrategyBaseService.name);
    constructor(
        protected tokenVoteService: EvmService,
        protected tokenWhitelistService: TokenWhitelistMongoService,
        protected graphqlService: GraphqlService,
    ) {
        // do nothing.
    }

    async runStrategy(
        params: StrategyRequestDto,
        strategy,
        resultTransformer,
    ): Promise<any> {
        const strategyResult = await strategy(
            params.account_id,
            params.block_height ?? null,
            this.tokenVoteService,
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
