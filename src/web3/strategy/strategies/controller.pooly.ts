import { Body, Controller, HttpCode, HttpStatus, Logger, OnApplicationBootstrap, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StrategyBaseController } from '../strategy.base.controller';
import { StrategyBaseService } from '../strategy.base.service';
import { StrategyMongoService } from '../strategy.mongo.service';
import * as path from 'path';
import { StrategyRequestDto } from '../strategy.dtos';
import { formatKebab } from '../strategy.utils';
import apiConfig from './CONFIG';
import { ERC20BalanceOfDto, ERC20TokenBalances, TokenList } from '../../token-vote/evm/evm.dtos';
import { EvmService } from '../../token-vote/evm/evm.service';
import { GraphqlService } from '../../token-vote/graphql/graphql.service';
import { ethers } from 'ethers';
import { strategyTypes } from '../../../common/constants';

const conf = {
    api_tag: apiConfig.API_TAG,
    api_url_base: apiConfig.API_TAG.toLowerCase(),
    // modify to match your startegy setting in CONFIG.ts
    name: apiConfig.STRATEGY_POOLY,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
};

@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)
export class PoolyErc721WeightedStrategy extends StrategyBaseController implements OnApplicationBootstrap {
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(
        ethAddress: string,
        blockHeight: number | null,
        evmService: EvmService,
        graphqlService: GraphqlService,
        logger: Logger,
        // tokenWhitelistService: TokenWhitelistMongoService,
    ) {

        if (blockHeight === 0) {
            blockHeight = await (await evmService.getEthersProvider(1)).getBlockNumber();
        }

        logger.debug(`blockHeight: ${blockHeight}`);

        const pooly1: ERC20BalanceOfDto = {
            contractAddress: '0x90B3832e2F2aDe2FE382a911805B6933C056D6ed',
            chain_id: 1,
            block_height: blockHeight,
        };

        const pooly2: ERC20BalanceOfDto = {
            contractAddress: '0x3545192b340F50d77403DC0A64cf2b32F03d00A9',
            chain_id: 1,
            block_height: blockHeight,
        };

        const pooly3: ERC20BalanceOfDto = {
            contractAddress: '0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523',
            chain_id: 1,
            block_height: blockHeight,
        };

        const tokens: TokenList = { tokens: [pooly1, pooly2, pooly3] };


        logger.debug(`getting balances for token list: ${JSON.stringify(tokens)}`);

        return await evmService.getErc20TokenBalances(ethAddress, tokens);
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(
        strategyResult: any,
        logger: Logger,
    ): string {
        let votingPower = 0;


        for (const token of (strategyResult as ERC20TokenBalances).tokenBalances) {

            if (token.tokenSymbol === 'POOLY3' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 3;
            } else if (token.tokenSymbol === 'POOLY2' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 2;
            } else if (token.tokenSymbol === 'POOLY1' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 1;
            }
        }


        logger.debug(`Total voting power: ${votingPower.toString()}`);

        return votingPower.toString();

    }

    // do not modify
    _getConf() {
        return conf;
    }

    // do not modify
    _getFileName() {
        return path.basename(__filename);
    }

    // do not modify
    @Post(formatKebab(conf.name))
    @ApiBody({ type: StrategyRequestDto })
    @ApiOperation({ description: conf.name })
    @ApiOkResponse({ description: 'Returns a users voting power under this strategy', type: String, isArray: false })
    @HttpCode(HttpStatus.OK)
    async post(
        @Body() params: StrategyRequestDto): Promise<string> {
        return (await super.runStrategy(
            params,
            this.strategy,
            this.responseTransformer,
        ));
    }
}