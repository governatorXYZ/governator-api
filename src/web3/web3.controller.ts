import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { ERC20TokenBalances, EthereumAccountVerifyDto, TokenList } from './web3.dto';
import { EthereumAccount } from '../account/ethereumAccount.schema';
import {EthereumAccountResponseDto} from "../account/account.dtos";


@ApiTags('Web 3')
@ApiSecurity('api_key')
@Controller()
export class Web3Controller {
    constructor(protected web3Service: Web3Service) {
        // do nothing
    }

    // @Get('web3/get-verification-message/:eth_address')
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

    @Post('web3/verify-signature')
    @ApiOperation({ description: 'Verify signature' })
    @ApiCreatedResponse({ description: 'Returns the updated ethereum account', type: EthereumAccountResponseDto })
    async verifySignature(@Body() ethAddressVerificationDto: EthereumAccountVerifyDto): Promise<EthereumAccount> {
        return await this.web3Service.verifySignature(ethAddressVerificationDto);
    }
}