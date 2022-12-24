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
    name: apiConfig.STRATEGY_DAOPUNKS,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: "Weighted voting strategy for DAOPUNK NFT holders " +
        "Your voting power will be calculated as the total number of DAOPUNKs " +
        "for all your verified wallets at the specified block-height."
};

@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)
export class DaoPunksStrategy extends StrategyBaseController implements OnApplicationBootstrap {
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

        const daopunks: ERC20BalanceOfDto = {
            contractAddress: '0x700f045de43FcE6D2C25df0288b41669B7566BbE',
            chain_id: 1,
            block_height: blockHeight,
        };

        const tokens: TokenList = { tokens: [daopunks] };


        logger.debug(`getting balances for token list: ${JSON.stringify(tokens)}`);

        return await evmService.getErc20TokenBalances(ethAddress, tokens);
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(
        strategyResult: any,
        logger: Logger,
    ): string {
        let votingPower = ethers.BigNumber.from('0');


        for (const token of (strategyResult as ERC20TokenBalances).tokenBalances) {

            if (ethers.BigNumber.from(token.balance).gt(ethers.BigNumber.from(0))) {
                votingPower.add(ethers.BigNumber.from(token.balance));
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