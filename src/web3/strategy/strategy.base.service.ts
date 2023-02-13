import { Injectable, Logger } from '@nestjs/common';
import { EvmService } from '../token-vote/evm/evm.service';
import { GraphqlService } from '../token-vote/graphql/graphql.service';
import { StrategyRequestDto } from './strategy.dtos';
import { ResultTransformerFunction, StrategyFunction } from './strategy.types';

@Injectable()
export class StrategyBaseService {
    readonly logger = new Logger(StrategyBaseService.name);
    constructor(
        protected evmService: EvmService,
        protected graphqlService: GraphqlService,
    ) {
        // do nothing.
    }

    async runStrategy(
        params: StrategyRequestDto,
        strategy: StrategyFunction,
        resultTransformer: ResultTransformerFunction,
    ): Promise<any> {
        const strategyResult = await strategy(
            {
                strategyRequest: {
                    account_id: params.account_id,
                    block_height: params.block_height ?? null,
                    strategy_options: params.strategy_options,
                },
                evmService: this.evmService,
                graphqlService: this.graphqlService,
                logger: this.logger,
            },
        );

        return resultTransformer(
            {
                strategyResult: strategyResult,
                logger: this.logger,
            },
        );
    }
}
