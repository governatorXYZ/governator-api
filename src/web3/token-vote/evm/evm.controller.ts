import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    ERC1155BalanceOfDto,
    ERC20TokenBalances,
    ERC721OwnerOfDto,
    ERC721OwnerOfResponseDto,
    TokenList,
} from './evm.dtos';
import { EthAddress } from '../../web3.dtos';
import { EvmService } from './evm.service';
import { ApiKeyAuthGuard } from '../../../auth/api-key/api-key.guard';

// TODO: obsolete? remove when refactoring routes.
@ApiTags('w3 - Token voting')
@ApiSecurity('api_key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class EvmController {
    constructor(protected tokenVoteService: EvmService) {
        // do nothing
    }

    @Post('token-voting/erc20-balance-of/:_id')
    @ApiOperation({
        description: 'Get ERC20 token balances of given address and token list',
    })
    // @ApiQuery({ name: 'block_number', type: Number, example: 14877360, required: false })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getErc20TokenBalances(@Param() params: EthAddress, @Body() tokenList: TokenList): Promise<ERC20TokenBalances> {
        return await this.tokenVoteService.getErc20TokenBalances(params._id, tokenList);
    }

    @Post('token-voting/erc721-balance-of/:_id')
    @ApiOperation({
        description: 'Get ERC721 token balances of given address and token list',
    })
    // @ApiQuery({ name: 'block_number', type: Number, example: 14877360, required: false })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getErc721TokenBalances(@Param() params: EthAddress, @Body() tokenList: TokenList): Promise<ERC20TokenBalances> {
        return await this.tokenVoteService.getErc721TokenBalances(params._id, tokenList);
    }

    @Post('token-voting/erc721-owner-of')
    @ApiOperation({
        description: 'Get owner addresses for given list of ERC721 token IDs',
    })
    // @ApiQuery({ name: 'block_number', type: Number, example: 14877360, required: false })
    @ApiCreatedResponse({ description: 'Returns a list of addresses', type: String, isArray: true })
    async getErc721OwnerOf(@Body() ownerOfDto: ERC721OwnerOfDto): Promise<ERC721OwnerOfResponseDto> {
        return await this.tokenVoteService.getErc721OwnerOf(ownerOfDto);
    }

    @Post('token-voting/erc1155-balance-of/:_id')
    @ApiOperation({
        description: 'Get ERC721 token balances of given address and token list',
    })
    // @ApiQuery({ name: 'block_number', type: Number, example: 14877360, required: false })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getErc1155BalanceOf(
        @Param() params: EthAddress,
        @Body() balanceOfDto: ERC1155BalanceOfDto,
            // @Query('block_number') blockNumber,
    ): Promise<number> {

        return await this.tokenVoteService.getErc1155BalanceOf(params._id, balanceOfDto);
    }


}