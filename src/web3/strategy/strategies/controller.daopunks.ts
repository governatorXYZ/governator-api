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
    name: apiConfig.STRATEGY_DAOPUNKS,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: 'Weighted voting strategy for DAOPUNK NFT holders ' +
        'Your voting power will be calculated as the total number of DAOPUNKs ' +
        'for all your verified wallets at the specified block-height.',
};

// do not modify
@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)

// modify: rename class
export class DaoPunksStrategy extends StrategyBaseController implements OnApplicationBootstrap {

    // do not modify
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(strategyUtils: StrategyUtils) {

        strategyUtils.logger.debug(`blockHeights: ${JSON.stringify(strategyUtils.strategyRequest.block_height)}`);

        const daopunks: ERC20BalanceOfDto = {
            contractAddress: '0x700f045de43FcE6D2C25df0288b41669B7566BbE',
            chain_id: 1,
            block_height: strategyUtils.strategyRequest.block_height.find(block => block.chain_id === '1').block,
        };

        const tokens: TokenList = { tokens: [daopunks] };


        strategyUtils.logger.debug(`getting balances for token list: ${JSON.stringify(tokens)}`);

        return await strategyUtils.evmService.getErc20TokenBalances(strategyUtils.strategyRequest.account_id, tokens);
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(resultTransformerParams: ResultTransformerParams): string {
        const votingPower = 0n;


        for (const token of (resultTransformerParams.strategyResult as ERC20TokenBalances).tokenBalances) {

            if (BigInt(token.balance) > 0n) {
                votingPower + BigInt(token.balance);
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