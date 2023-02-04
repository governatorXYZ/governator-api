import { Injectable, Logger } from '@nestjs/common';

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { EvmService } from '../../token-vote/evm/evm.service';


@Injectable()
export class GraphqlService {
    private readonly logger = new Logger(GraphqlService.name);
    constructor(
        protected evmService: EvmService,
    ) {
        // do nothing
    }

    async query(url: string, querystring, variables = undefined) {

        this.logger.debug(`Querying graph on: ${url}`);

        const httpLink = createHttpLink({
            uri: url,
            fetch: fetch,
        });

        const client = new ApolloClient({
            link: httpLink,
            cache: new InMemoryCache(),
        });

        const query = gql(querystring);

        this.logger.debug(querystring);

        let result: any;

        try {
            result = await client.query({
                query,
                variables,
            });

            this.logger.debug(result);

        } catch (err) {
            this.logger.debug(err);
        }

        return result;
    }

    async getEquivalentBlock(blockHeight, chainId) {

        if(chainId !== '137') {
            return 0;
        }

        const mainnetProvider = await this.evmService.getEthersProvider(1);

        const gqlResult = await this.query(
            'https://blockfinder.snapshot.org/',
            `query {blocks (where: { ts: ${(await mainnetProvider.getBlock(blockHeight)).timestamp}, network_in: ["${chainId}"] }) {
        network
        number}}`,
        );
    
        try {
            if ((gqlResult.data.blocks.length > 0) && (gqlResult.data.blocks[0].number >= 13000000)) return gqlResult.data.blocks[0].number;
    
        } catch (e) {
            this.logger.error('failed to fetch equivalent block from graph', e);
            return 0;
        }
    }

}