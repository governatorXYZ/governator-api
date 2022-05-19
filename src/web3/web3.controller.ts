import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags} from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { ERC20TokenBalances, TokenList } from './web3.dto';

@ApiTags('Web 3')
@ApiSecurity('api_key')
@Controller()
export class Web3Controller {
    constructor(protected web3Service: Web3Service) {
        // do nothing
    }

    @Post('web3/token-balance/:eth_address')
    @ApiOperation({
        description: 'Get token balances of given address and token list',
    })
    @ApiParam({ name: 'eth_address', description: 'Eth address to find token balances of' })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getTokenBalances(@Param('eth_address') ethAddress, @Body() tokenList: TokenList): Promise<ERC20TokenBalances> {
        return await this.web3Service.getTokenBalances(ethAddress, tokenList);
    }

    @Get('web3/get-login-message/:eth_address')
    @ApiOperation({ description: 'Request a message to be signed by account owner' })
    @ApiOkResponse({ description: 'Message sent' })
    async getLoginMessage(@Param('eth_address') ethAddress): Promise<string> {
        return `By signing this message you prove ownership of the account ${ethAddress} and agree to our terms & conditions`;
    }

    @Post('web3/proof-account-ownership/:eth_address')
    @ApiOperation({ description: 'Verify signature' })
    @ApiParam({ name: 'eth_address', description: 'Account address of message signer' })
    @ApiCreatedResponse({ description: 'Returns the address that signed message producing signature', type: String })
    async verifySignature(@Param('eth_address') ethAddress, @Body() data: { message: string, signature: string }): Promise<ERC20TokenBalances> {
        return await this.web3Service.verifySignature(ethAddress, data);
    }
}