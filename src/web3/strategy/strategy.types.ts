import { Logger } from '@nestjs/common';
import { EvmService } from '../token-vote/evm/evm.service';
import { GraphqlService } from '../token-vote/graphql/graphql.service';
import { StrategyRequestDto } from './strategy.dtos';

export type StrategyFunction = (strategyUtils: StrategyUtils) => any;

export interface StrategyUtils {
    strategyRequest: StrategyRequestDto
    evmService: EvmService,
    graphqlService: GraphqlService,
    logger: Logger,
}

export type ResultTransformerFunction = (resultTransformerParams: ResultTransformerParams) => string;

export interface ResultTransformerParams {
    strategyResult: any,
    logger: Logger,
}