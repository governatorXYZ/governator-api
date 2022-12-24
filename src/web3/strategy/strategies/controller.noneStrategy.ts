import { Body, Controller, HttpCode, HttpStatus, OnApplicationBootstrap, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StrategyBaseController } from '../strategy.base.controller';
import { StrategyBaseService } from '../strategy.base.service';
import { StrategyMongoService } from '../strategy.mongo.service';
import * as path from 'path';
import { StrategyRequestDto } from '../strategy.dtos';
import { formatKebab } from '../strategy.utils';
import apiConfig from './CONFIG';
import { strategyTypes } from '../../../common/constants';

const conf = {
    api_tag: apiConfig.API_TAG,
    api_url_base: apiConfig.API_TAG.toLowerCase(),
    // modify to match your startegy setting in CONFIG.ts
    name: apiConfig.STRATEGY_NONE,
    strategy_type: strategyTypes.STRATEGY_TYPE_ONE_EQUALS_ONE,
    description: "This strategy allowes for one vote per discord user."
};

@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)
export class NoneStrategy extends StrategyBaseController implements OnApplicationBootstrap {
    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        super(strategyService, strategyMongoService);
    }

    // modify: implement strategy here
    async strategy(
    ) {
        return '1';
    }

    // transform strategy result, or use to chain strategies
    responseTransformer(
        strategyResult: any,
    ): string {
        return strategyResult;

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