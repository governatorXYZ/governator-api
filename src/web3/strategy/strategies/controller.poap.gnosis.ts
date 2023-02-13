import { Body, Controller, HttpCode, HttpStatus, OnApplicationBootstrap, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StrategyBaseController } from '../strategy.base.controller';
import { StrategyBaseService } from '../strategy.base.service';
import { StrategyMongoService } from '../strategy.mongo.service';
import * as path from 'path';
import { StrategyRequestDto } from '../strategy.dtos';
import { formatKebab } from '../strategy.utils';
import apiConfig from './CONFIG';
import { ethers } from 'ethers';
import { strategyTypes } from '../../../common/constants';
import { ResultTransformerParams, StrategyUtils } from '../strategy.types';

const conf = {
    api_tag: apiConfig.API_TAG,
    api_url_base: apiConfig.API_TAG.toLowerCase(),
    // modify to match your startegy setting in CONFIG.ts
    name: apiConfig.STRATEGY_POAP_EVENT,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: 'POAP gated voting strategy on gnosis & Ethereum mainnet. This strategy allows for passing a POAP event_id to the satrtegy_options used for gating the poll',
};

// do not modify
@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)

// modify: rename class
export class PoapEventStrategy extends StrategyBaseController implements OnApplicationBootstrap {

    // do not modify
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(strategyUtils: StrategyUtils) {

        // const gosisBlockHeight = strategyUtils.strategyRequest.block_height.find((blockHeight) => blockHeight.chain_id === '100').block;

        strategyUtils.logger.debug(`blockHeights: ${JSON.stringify(strategyUtils.strategyRequest.block_height)}`);

        const poapEventId = strategyUtils.strategyRequest.strategy_options.event_id;

        strategyUtils.logger.debug(`checking balance for eventId: ${poapEventId}`);

        const poapContractAbi = [
            'function balanceOf(address owner) view returns (uint256 balance)',
            'function tokenDetailsOfOwnerByIndex(address owner, uint256 index) view returns (uint256 tokenId, uint256 eventId)',
        ];

        const poapContractAddresss = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

        const contractGnosis = await strategyUtils.evmService.connectContract(poapContractAddresss, poapContractAbi, 100);

        const poapBalanceGnosis = (await contractGnosis.balanceOf(strategyUtils.strategyRequest.account_id) as ethers.BigNumber).toNumber();

        strategyUtils.logger.log(poapBalanceGnosis);

        if(poapBalanceGnosis > 0) {
            for(let i = 0; i < poapBalanceGnosis; i++) {
                const tokenDetails = await contractGnosis.tokenDetailsOfOwnerByIndex(strategyUtils.strategyRequest.account_id, i).catch(e => strategyUtils.logger.error(e));
                if (tokenDetails[1].toString() === poapEventId) return '1';
            }
        }

        const contractEthereum = await strategyUtils.evmService.connectContract(poapContractAddresss, poapContractAbi, 1);

        const poapBalanceEthereum = (await contractEthereum.balanceOf(strategyUtils.strategyRequest.account_id) as ethers.BigNumber).toNumber();

        if(poapBalanceEthereum > 0) {
            for(let i = 0; i < poapBalanceEthereum; i++) {
                const tokenDetails = await contractEthereum.tokenDetailsOfOwnerByIndex(strategyUtils.strategyRequest.account_id, i).catch(e => strategyUtils.logger.error(e));
                if (tokenDetails[1].toString() === poapEventId) return '1';
            }
        }

        return '0';
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(resultTransformerParams: ResultTransformerParams): string {
        return resultTransformerParams.strategyResult;
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