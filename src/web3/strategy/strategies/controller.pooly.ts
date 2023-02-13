import { Body, Controller, HttpCode, HttpStatus, OnApplicationBootstrap, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StrategyBaseController } from '../strategy.base.controller';
import { StrategyBaseService } from '../strategy.base.service';
import { StrategyMongoService } from '../strategy.mongo.service';
import * as path from 'path';
import { StrategyRequestDto } from '../strategy.dtos';
import { formatKebab } from '../strategy.utils';
import apiConfig from './CONFIG';
import { ERC20BalanceOfDto, ERC20TokenBalances, TokenList } from '../../token-vote/evm/evm.dtos';
import { ethers } from 'ethers';
import { strategyTypes } from '../../../common/constants';
import { ResultTransformerParams, StrategyUtils } from '../strategy.types';

const conf = {
    api_tag: apiConfig.API_TAG,
    api_url_base: apiConfig.API_TAG.toLowerCase(),
    // modify to match your startegy setting in CONFIG.ts
    name: apiConfig.STRATEGY_POOLY,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: 'Weighted voting strategy for POOLY NFT holders ' +
        'Your voting power will be calculated based on the type of POOLY you hold ' +
        'POOLY1 = 1, POOLY2 = 2, POOLY3 = 3. ' +
        'Sum of all your verified wallets at the specified block-height.',
};

// do not modify
@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)

// modify: rename class
export class PoolyErc721WeightedStrategy extends StrategyBaseController implements OnApplicationBootstrap {

    // do not modify
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(strategyUtils: StrategyUtils) {

        strategyUtils.logger.debug(`blockHeights: ${strategyUtils.strategyRequest.block_height}`);

        const mainnetBlock = strategyUtils.strategyRequest.block_height.find(block => block.chain_id === '1').block;

        const pooly1: ERC20BalanceOfDto = {
            contractAddress: '0x90B3832e2F2aDe2FE382a911805B6933C056D6ed',
            chain_id: 1,
            block_height: mainnetBlock,
        };

        const pooly2: ERC20BalanceOfDto = {
            contractAddress: '0x3545192b340F50d77403DC0A64cf2b32F03d00A9',
            chain_id: 1,
            block_height: mainnetBlock,
        };

        const pooly3: ERC20BalanceOfDto = {
            contractAddress: '0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523',
            chain_id: 1,
            block_height: mainnetBlock,
        };

        const tokens: TokenList = { tokens: [pooly1, pooly2, pooly3] };


        strategyUtils.logger.debug(`getting balances for token list: ${JSON.stringify(tokens)}`);

        return await strategyUtils.evmService.getErc20TokenBalances(strategyUtils.strategyRequest.account_id, tokens);
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(resultTransformerParams: ResultTransformerParams): string {
        let votingPower = 0;

        for (const token of (resultTransformerParams.strategyResult as ERC20TokenBalances).tokenBalances) {

            if (token.tokenSymbol === 'POOLY3' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 3;
            } else if (token.tokenSymbol === 'POOLY2' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 2;
            } else if (token.tokenSymbol === 'POOLY1' && ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower = 1;
            }
        }

        resultTransformerParams.logger.debug(`Total voting power: ${votingPower.toString()}`);

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