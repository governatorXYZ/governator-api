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
import { strategyTypes } from '../../../common/constants';
import { ResultTransformerParams, StrategyUtils } from '../strategy.types';

const conf = {
    api_tag: apiConfig.API_TAG,
    api_url_base: apiConfig.API_TAG.toLowerCase(),
    // modify to match your startegy setting in CONFIG.ts
    name: apiConfig.STRATEGY_BANKLESS_DAO,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: 'Weighted voting strategy for BANK token on Ethereum mainnet and polygon. ' +
        'Your voting power will be calculated as the total balance of BANK (mainnet & polygon) ' +
        'for all your verified wallets at the speciefied block-height.',
};

// do not modify
@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)

// modify: rename class
export class BankTokenWeightedStrategy extends StrategyBaseController implements OnApplicationBootstrap {

    // do not modify
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(strategyUtils: StrategyUtils) {

        const polygonBlockHeight = strategyUtils.strategyRequest.block_height.find((blockHeight) => blockHeight.chain_id === '137').block;
        const mainnetBlockHeight = strategyUtils.strategyRequest.block_height.find((blockHeight) => blockHeight.chain_id === '1').block;

        strategyUtils.logger.debug(`blockHeights: ${JSON.stringify(strategyUtils.strategyRequest.block_height)}`);

        strategyUtils.logger.debug(`equivalentBlockHeight: ${polygonBlockHeight}`);

        const banklessTokenMain: ERC20BalanceOfDto = {
            contractAddress: '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198',
            chain_id: 1,
            block_height: mainnetBlockHeight,
        };

        const banklessTokenPolygon: ERC20BalanceOfDto = {
            contractAddress: '0xDB7Cb471dd0b49b29CAB4a1C14d070f27216a0Ab',
            chain_id: 137,
            block_height: polygonBlockHeight,
        };

        let tokens: TokenList;

        if (banklessTokenPolygon.block_height) {
            tokens = { tokens: [banklessTokenMain, banklessTokenPolygon] };

        } else {
            tokens = { tokens: [banklessTokenMain] };

        }

        strategyUtils.logger.debug(`getting balances for token list: ${JSON.stringify(tokens)}`);

        return await strategyUtils.evmService.getErc20TokenBalances(strategyUtils.strategyRequest.account_id, tokens);
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(resultTransformerParams: ResultTransformerParams): string {
        let votingPower = 0n;


        for (const token of (resultTransformerParams.strategyResult as ERC20TokenBalances).tokenBalances) {
            const bigNumber = BigInt(token.balance);

            resultTransformerParams.logger.debug(`balance ${token.balance}`);
            resultTransformerParams.logger.debug(`balanceBigN ${bigNumber}`);

            votingPower = votingPower + bigNumber;
        }


        resultTransformerParams.logger.debug(`Total voting power: ${votingPower.toString()}`);

        // return ethers.utils.formatEther(votingPower).toString();
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