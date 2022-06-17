import { Injectable, Logger } from '@nestjs/common';

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import fetch from 'node-fetch';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';


@Injectable()
export class GraphqlService {
    private readonly logger = new Logger(GraphqlService.name);
    constructor() {
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

}