import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ERC20TokenBalances, TokenList } from '../web3.dto';
import { EthereumAccountCreateDto } from '../../account/account.dtos';
import { TokenVoteService } from './token-vote.service';

@ApiTags('w3 - Token voting')
@ApiSecurity('api_key')
@Controller()
export class TokenVoteController {
    constructor(protected tokenVoteService: TokenVoteService) {
        // do nothing
    }

    @Post('token-voting/erc20-balance-of/:eth_address')
    @ApiOperation({
        description: 'Get token balances of given address and token list',
    })
    @ApiParam({ name: 'eth_address', description: 'Eth address to find token balances of' })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getErc20TokenBalances(@Param() params: EthereumAccountCreateDto, @Body() tokenList: TokenList): Promise<ERC20TokenBalances> {
        return await this.tokenVoteService.getErc20TokenBalances(params._id, tokenList);
    }
}