import { Injectable, Logger } from '@nestjs/common';
import snapshot from '@snapshot-labs/snapshot.js';
import constants from '../../common/constants';
import snapshotStrategies from 'snapshot-strategies';


@Injectable()
export class SnapshotService {
    private readonly logger = new Logger(SnapshotService.name);
    constructor() {
        // do nothing
    }

    async getSnapshotSpaceById(space) {

        this.logger.debug(`Querying snapshot space: ${space}`);

        const query = {
            spaces: {
                __args: {
                    skip: 0,
                    orderBy: 'created',
                    where: { id: space },
                },
                id: true,
                name: true,
                about: true,
                network: true,
                symbol: true,
                strategies: {
                    name: true,
                    network: true,
                    params: true,
                },
                admins: true,
                members: true,
                filters: {
                    minScore: true,
                    onlyMembers: true,
                },
                plugins: true,
            },
        };

        return await snapshot.utils.subgraphRequest(constants.SNAPSHOT_GRAPHQL_URL, query);
    }

    async getSnapshotStrategies(space) {

        this.logger.debug(`Getting strategies for snapshot space: ${space}`);

        const query = {
            spaces: {
                __args: {
                    skip: 0,
                    orderBy: 'created',
                    where: { id: space },
                },
                strategies: {
                    name: true,
                    network: true,
                    params: true,
                },
            },
        };

        const response = await snapshot.utils.subgraphRequest(constants.SNAPSHOT_GRAPHQL_URL, query);

        return response.spaces[0].strategies;
    }

    async getSnapshotVotingPower(space: string, network: string, voters: Array<string>, blockNumber: number) {

        this.logger.debug(`Calculating voting power for address: \n${voters} \nOn space: ${space} \nAt block height: ${blockNumber} \nOn network: ${network}`);

        const provider = snapshotStrategies.utils.getProvider(network);

        const strategies = await this.getSnapshotStrategies(space);

        return await snapshotStrategies.utils.getScoresDirect(
            space,
            strategies,
            network,
            provider,
            voters,
            blockNumber,
        ).catch((e) => this.logger.error(e));
    }

    // async listSnapshotSpaces(skip = 0) {
    //
    //     const spaceList = [];
    //     let spacesLen = 100;
    //
    //     while (spacesLen > 0) {
    //         const query = {
    //             spaces: {
    //                 __args: {
    //                     first: 1000,
    //                     skip: skip,
    //                     orderBy: 'alphabetic',
    //                 },
    //                 id: true,
    //                 name: true,
    //             },
    //         };
    //
    //         const spaces = await snapshot.utils.subgraphRequest(constants.SNAPSHOT_GRAPHQL_URL, query);
    //         spaces.spaces.forEach((space) => spaceList.push(space));
    //         spacesLen = spaces.spaces.length;
    //         skip += 1000;
    //     }
    //     return spaceList;
    // }

}