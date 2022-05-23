import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { ERC20TokenBalances, EthAddressVerificationDto, TokenList } from './web3.dto';
import { Account } from '../account/account.schema';


@ApiTags('Web 3')
@ApiSecurity('api_key')
@Controller()
export class Web3Controller {
    constructor(protected web3Service: Web3Service) {
        // do nothing
    }

    // @Get('web3/get-login-message/:eth_address')
    // @ApiParam({ name: 'eth_address', description: 'Eth address to find verification message for' })
    // @ApiOperation({ description: 'Request a message to be signed by account owner' })
    // @ApiOkResponse({ description: 'Message sent' })
    // async getVerificationMessage(@Param('eth_address') ethAddress): Promise<string> {
    //     return await this.web3Service.getVerificationMessage(ethAddress);
    // }

    @Post('web3/token-balance/:eth_address')
    @ApiOperation({
        description: 'Get token balances of given address and token list',
    })
    @ApiParam({ name: 'eth_address', description: 'Eth address to find token balances of' })
    @ApiCreatedResponse({ description: 'Returns a list of token balances for address and token list provided', type: ERC20TokenBalances })
    async getTokenBalances(@Param('eth_address') ethAddress, @Body() tokenList: TokenList): Promise<ERC20TokenBalances> {
        return await this.web3Service.getTokenBalances(ethAddress, tokenList);
    }

    @Post('web3/prove-account-ownership')
    @ApiOperation({ description: 'Verify signature' })
    @ApiCreatedResponse({ description: 'Returns the address that signed message producing signature', type: String })
    async verifySignature(@Body() ethAddressVerificationDto: EthAddressVerificationDto): Promise<Account> {
        return await this.web3Service.verifySignature(ethAddressVerificationDto);
    }
}