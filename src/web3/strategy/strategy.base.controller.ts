import { Controller, Logger } from '@nestjs/common';
import { StrategyBaseService } from './strategy.base.service';
import crypto from 'crypto';
import { StrategyMongoService } from './strategy.mongo.service';
import { ApiSecurity } from '@nestjs/swagger';
import { StrategyRequestDto } from './strategy.dtos';
import { UserResponseDto } from '../../user/user.dtos';
import { EvmService } from '../token-vote/evm/evm.service';
import { SnapshotService } from '../token-vote/snapshot/snapshot.service';
import { GraphqlService } from '../token-vote/graphql/graphql.service';

@ApiSecurity('api_key')
@Controller()
export class StrategyBaseController {
    readonly logger = new Logger(StrategyBaseController.name);

    constructor(
        protected strategyService: StrategyBaseService,
        protected strategyMongoService: StrategyMongoService,
    ) {
        // do nothing.
    }

    _getConf() {
        return null;
    }

    _getFileName() {
        return null;
    }

    async onApplicationBootstrap(): Promise<void> {
        this.logger.debug('Preparing to seed database with strategies');

        if (!this._getFileName() || !this._getConf()) return;

        this.logger.debug(`Registering strategy file ${this._getFileName()}`);

        this.logger.debug(`With configuration ${JSON.stringify(this._getConf())}`);

        const hash = crypto.createHash('md5').update(this._getFileName()).digest('hex');

        const filter = {
            name: this._getConf().name,
            endpoint: this._getConf().api_url_base + '/' + this._getConf().endpoint,
        };

        await this.strategyMongoService.updateOneByIdStrategy(hash, filter);

        const stale = await this.strategyMongoService.findManyStrategy({ updatedAt: { $lt: new Date(Date.now() - 10000) } });

        if (stale.length > 0) {
            this.logger.debug(`Removing stale strategies: ${stale}`);

            for (const strat of stale) {
                await this.strategyMongoService.deleteOneByIdStrategy(strat._id);
            }
        }

    }

    runStrategy(
        params: StrategyRequestDto,
        strategy: (user: UserResponseDto,
                   blockHeight: number | null,
                   evmService: EvmService,
                   snapshotService: SnapshotService,
                   graphqlService: GraphqlService,
                   logger: Logger,
                   // tokenWhitelistService: TokenWhitelistMongoService,
                   ) => any,
        resultTransformer: (preloads: any[],
                            strategyResult: any,
                            logger: Logger,
                            // ethersLib: any,
                            ) => string,
    ) {
        this.logger.debug(`Running strategy ${strategy.name}`);
        return this.strategyService.runStrategy(
            params,
            strategy,
            resultTransformer,
        );
    }
}