import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TokenWhitelistMongoService } from './token-whitelist.mongo.service';
import { TokenWhitelist } from './token-whitelist.schema';
import { TokenWhitelistCreateDto, TokenWhitelistResponseDto } from './token-whitelist-dtos';
import { Token } from '../../web3.dtos';
import { parseEthAddressPipe } from '../../../common/parseEthAddress.pipe';
import { ApiKeyAuthGuard } from '../../../auth/api-key/api-key.guard';

@ApiTags('w3 - Token whitelist')
@ApiSecurity('api_key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class TokenWhitelistController {
    constructor(
        protected tokenWhitelistMongoService: TokenWhitelistMongoService,
    ) {
        // do nothing
    }

    @Get('token-whitelist/list')
    @ApiOperation({ description: 'List all whitelisted tokens' })
    @ApiCreatedResponse({ description: 'Returns a list of whitelist token objects', type: TokenWhitelistResponseDto, isArray: true })
    async findAllTokenWhitelist(): Promise<TokenWhitelist[]> {
        return await this.tokenWhitelistMongoService.findManyTokenWhitelist({});
    }

    @Get('token-whitelist/list/:erc')
    @ApiOperation({ description: 'List all whitelisted tokens of specified ERC type' })
    @ApiCreatedResponse({ description: 'Returns a list of whitelist token objects', type: TokenWhitelistResponseDto, isArray: true })
    @ApiParam({ name: 'erc', description: 'Type of token ERC standard', enum: [20, 721, 1155] })
    async findAllTokenWhitelistERC(@Param('erc', ParseIntPipe) erc): Promise<TokenWhitelist[]> {
        return await this.tokenWhitelistMongoService.findManyTokenWhitelist({ erc: erc });
    }

    @Get('token-whitelist/find/:contractAddress/:chain_id')
    @ApiOperation({ description: 'Find a token by contract address' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object', type: TokenWhitelistResponseDto })
    @ApiParam({ name: 'contractAddress', description: 'Token contract address' })
    @ApiParam({ name: 'chain_id', description: 'Chain ID' })
    async findManyTokenWhitelist(
        @Param('contractAddress', parseEthAddressPipe) contractAddress,
        @Param('chain_id', ParseIntPipe) chainId,
    ): Promise<TokenWhitelist[]> {
        return await this.tokenWhitelistMongoService.findManyTokenWhitelist({
            _id: {
                contractAddress: contractAddress,
                chain_id: chainId,
            } as Token,
        });
    }

    @Post('token-whitelist/add')
    @ApiOperation({ description: 'Whitelist a token' })
    @ApiCreatedResponse({ description: 'Returns the new token object', type: TokenWhitelistResponseDto })
    async createTokenWhitelist(@Body() tokenWhitelistCreateDto: TokenWhitelistCreateDto): Promise<TokenWhitelist> {
        return await this.tokenWhitelistMongoService.createTokenWhitelist(tokenWhitelistCreateDto);
    }

    // @Patch('token-whitelist/update/:contractAddress/:chain_id')
    // @ApiOperation({ description: 'Update a tokent' })
    // @ApiCreatedResponse({ description: 'Returns the updated token object', type: TokenWhitelistResponseDto })
    // @ApiParam({ name: 'contractAddress', description: 'Token contract address' })
    // @ApiParam({ name: 'chain_id', description: 'Chain ID' })
    // async findOneAndUpdateTokenWhitelist(
    //     @Param('contractAddress', parseEthAddressPipe) contractAddress,
    //     @Param('chain_id', ParseIntPipe) chainId,
    //     @Body() tokenWhitelistCreateDto: TokenWhitelistCreateDto,
    // ): Promise<TokenWhitelist> {
    //     return await this.tokenWhitelistMongoService.findOneAndUpdateTokenWhitelist({
    //         _id: {
    //             contractAddress: contractAddress,
    //             chain_id: chainId,
    //         } as Token,
    //     }, tokenWhitelistCreateDto);
    // }

    @Delete('token-whitelist/delete/:contractAddress/:chain_id')
    @ApiOperation({ description: 'Delete a token' })
    @ApiCreatedResponse({ description: 'Returns the deleted token object', type: TokenWhitelistResponseDto })
    @ApiParam({ name: 'contractAddress', description: 'Token contract address' })
    @ApiParam({ name: 'chain_id', description: 'Chain ID' })
    async findOneAndDeleteTokenWhitelist(
        @Param('contractAddress', parseEthAddressPipe) contractAddress,
        @Param('chain_id', ParseIntPipe) chainId,
    ): Promise<TokenWhitelist> {
        return await this.tokenWhitelistMongoService.findOneAndDeleteTokenWhitelist({
            _id: {
                contractAddress: contractAddress,
                chain_id: chainId,
            } as Token,
        });
    }
}