import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { EthereumAccount } from '../../account/ethereumAccount.schema';
import { EthereumAccountResponseDto } from '../../account/account.dtos';
import { EthAddress } from '../web3.dtos';
import { SiweService } from './siwe.service';
import { SiweVerifyDto } from './siwe.dtos';
import { ApiKeyAdminAuthGuard } from '../../auth/api-key/api-key.guard';

@ApiTags('w3 - SIWE')
@ApiSecurity('api_key')
@UseGuards(ApiKeyAdminAuthGuard)
@Controller()
export class SiweController {
    constructor(protected siweService: SiweService) {
        // do nothing
    }

    @Get('siwe/nonce/:_id')
    @ApiOperation({ description: 'Get nonce' })
    @ApiOkResponse({ description: 'Provides fresh nonce valid for 60 sec', type: String })
    async getNonce(@Param() params: EthAddress): Promise<string> {
        return await this.siweService.getNonce(params._id);
    }

    @Post('siwe/verify')
    @ApiOperation({ description: 'Verify signature' })
    @ApiCreatedResponse({ description: 'Returns the verified ethereum account with updated user_id', type: EthereumAccountResponseDto })
    async verifySignature(@Body() siweVerifyDto: SiweVerifyDto): Promise<EthereumAccount> {
        return await this.siweService.verifySignature(siweVerifyDto);
    }
}