import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { StrategyMongoService } from './strategy.mongo.service';
import { ApiOkResponse, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import apiConfig from './strategies/CONFIG';
import { StrategyResponseDto } from './strategy.dtos';
import { ApiKeyAuthGuard } from '../../auth/api-key/api-key.guard';


@ApiSecurity('api_key')
@ApiTags(apiConfig.API_TAG)
@UseGuards(ApiKeyAuthGuard)
@Controller(apiConfig.API_TAG.toLowerCase())
export class StrategyController {
    readonly logger = new Logger(StrategyController.name);

    constructor(
        protected strategyMongoService: StrategyMongoService,
    ) {
        // do nothing.
    }

    @Get('find/one/:_id')
    @ApiParam({ name: '_id', description: 'Strategy ID' })
    @ApiOkResponse({ description: 'Returns specified strategies', type: StrategyResponseDto })
    async getOne(@Param('_id') id: string): Promise<StrategyResponseDto> {
        return ((await this.strategyMongoService.findManyStrategy({ _id: id }))[0]);
    }

    @Get('find/all')
    @ApiOkResponse({ description: 'Returns all strategies', type: StrategyResponseDto, isArray: true })
    async getAll(): Promise<StrategyResponseDto[]> {
        return await this.strategyMongoService.findManyStrategy({});
    }
}