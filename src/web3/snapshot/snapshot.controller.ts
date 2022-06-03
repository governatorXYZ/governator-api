import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';

@ApiTags('w3 - Snapshot')
@ApiSecurity('api_key')
@Controller()
export class SnapshotController {
    constructor(protected snapshotService: SnapshotService) {
        // do nothing
    }

    @Get('snapshot/find-space/:space')
    @ApiOperation({ description: 'get a list of all snapshot spaces' })
    @ApiParam({ name: 'space', description: 'Ens of space to quey', example: 'banklessvault.eth' })
    async getSnapshotSpaceById(@Param('space') space): Promise<any> {
        return await this.snapshotService.getSnapshotSpaceById(space);
    }

    @Get('snapshot/strategies/:space')
    @ApiOperation({ description: 'Get snapshot strategy definitions' })
    @ApiParam({ name: 'space', description: 'ens of space to quey (e.g. banklessvault.eth)' })
    async getSnapshotStrategies(@Param('space') space): Promise<any> {
        return await this.snapshotService.getSnapshotStrategies(space);
    }

    @Get('snapshot/voting-power')
    @ApiOperation({ description: 'Get snapshot voting power per strategy for an array of addresses' })
    @ApiQuery({ name: 'space', type: String, example: 'banklessvault.eth' })
    @ApiQuery({ name: 'network', type: Number, example: '1' })
    @ApiQuery({ name: 'voter', type: String, example: '0x123..' })
    @ApiQuery({ name: 'block_number', type: Number, example: 14877360 })
    async getSnapshotVotingPower(
        @Query('space') space,
        @Query('network') network,
        @Query('voter') voter,
        @Query('block_number') blockNumber,
    ): Promise<any> {
        return await this.snapshotService.getSnapshotVotingPower(space, network, [voter], Number(blockNumber));
    }
}