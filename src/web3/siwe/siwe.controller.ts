import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { EthereumAccountVerifyDto } from '../web3.dto';
import { EthereumAccount } from '../../account/ethereumAccount.schema';
import { EthereumAccountResponseDto } from '../../account/account.dtos';
import { EthAddress } from '../web3.dto';
import { SiweService } from './siwe.service';

@ApiTags('w3 - SIWE')
@ApiSecurity('api_key')
@Controller()
export class SiweController {
    constructor(protected siweService: SiweService) {
        // do nothing
    }

    @Get('siwe/nonce/:_id')
    @ApiOperation({ description: 'Get nonce' })
    @ApiOkResponse({ description: 'Provides fresh nonce valid for 60 sec', type: String })
    @ApiParam({ name: '_id', description: 'Ethereum address of account to verify', example: '0x123..' })
    async getNonce(@Param() params: EthAddress): Promise<string> {
        console.log(params);
        return 'hey';
        // return await this.siweService.getNonce(params._id);
    }

    @Post('siwe/verify')
    @ApiOperation({ description: 'Verify signature' })
    @ApiCreatedResponse({ description: 'Returns the updated ethereum account', type: EthereumAccountResponseDto })
    async verifySignature(@Body() ethAddressVerificationDto: EthereumAccountVerifyDto): Promise<EthereumAccount> {
        return await this.siweService.verifySignature(ethAddressVerificationDto);
    }
}