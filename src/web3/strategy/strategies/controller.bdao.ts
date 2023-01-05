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
    name: apiConfig.STRATEGY_BANKLESS_DAO,
    strategy_type: strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED,
    description: 'Weighted voting strategy for BANK token on Ethereum mainnet and polygon. ' +
        'Your voting power will be calculated as the total balance of BANK (mainnet & polygon) ' +
        'for all your verified wallets at the speciefied block-height.',
};

@ApiTags(conf.api_tag)
@Controller(conf.api_url_base)
export class BankTokenWeightedStrategy extends StrategyBaseController implements OnApplicationBootstrap {
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

        let equivalentBlock = null;

        if (blockHeight < 0) {
            equivalentBlock = blockHeight;

        } else if (blockHeight === 0) {
            equivalentBlock = await (await evmService.getEthersProvider(137)).getBlockNumber();

            blockHeight = await (await evmService.getEthersProvider(1)).getBlockNumber();

        } else {
            const mainnetProvider = await evmService.getEthersProvider(1);

            // logger.debug(`timestamp ${(await mainnetProvider.getBlock(blockHeight)).timestamp}`);

            // TODO: make own graph because sometimes down (rate limit?) - also implement retry here to avoid rate limit
            // might utilize TheGraph's indexer. You can create a very simple subgraph that just stores a Block that contains a block number and timestamp. Once indexer is done indexing, you can query the data using GraphQL and write to your DB.
            const gqlResult = await graphqlService.query(
                'https://blockfinder.snapshot.org/',
                `query {blocks (where: { ts: ${(await mainnetProvider.getBlock(blockHeight)).timestamp}, network_in: ["137"] }) {
            network
            number}}`,
            );

            try {
                if ((gqlResult.data.blocks.length > 0) && (gqlResult.data.blocks[0].number >= 13000000)) equivalentBlock = gqlResult.data.blocks[0].number;

            } catch {
                logger.debug('failed to fetch equivalent block from graph');

            }
        }

        logger.debug(`blockHeight: ${blockHeight}`);

        logger.debug(`equivalentBlockHeight: ${equivalentBlock}`);

        const banklessTokenMain: ERC20BalanceOfDto = {
            contractAddress: '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198',
            chain_id: 1,
            block_height: blockHeight,
        };

        const banklessTokenPolygon: ERC20BalanceOfDto = {
            contractAddress: '0xDB7Cb471dd0b49b29CAB4a1C14d070f27216a0Ab',
            chain_id: 137,
            block_height: equivalentBlock,
        };

        let tokens: TokenList;

        if (banklessTokenPolygon.block_height) {
            tokens = { tokens: [banklessTokenMain, banklessTokenPolygon] };

        } else {
            tokens = { tokens: [banklessTokenMain] };

        }

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
            const bigNumber = ethers.BigNumber.from(token.balance);

            logger.debug(`balance ${token.balance}`);
            logger.debug(`balanceBigN ${token.balance}`);

            votingPower = votingPower.add(bigNumber);
        }


        logger.debug(`Total voting power: ${votingPower.toString()}`);

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