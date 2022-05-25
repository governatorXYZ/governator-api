import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    DiscordAccountCreateDto,
    DiscordAccountResponseDto,
    EthereumAccountCreateDto,
    EthereumAccountResponseDto,
} from './account.dtos';
import { EthereumAccountMongoService } from './ethereumAccount.mongo.service';
import { EthereumAccount } from './ethereumAccount.schema';
import { DiscordAccount } from './discordAccount.schema';
import { DiscordAccountMongoService } from './discordAccount.mongo.service';

@ApiTags('Account')
@ApiSecurity('api_key')
@Controller()
export class AccountController {
    constructor(
        protected ethereumMongoService: EthereumAccountMongoService,
        protected discordMongoService: DiscordAccountMongoService,
    ) {
        // do nothing
    }

    @Post('account/ethereum/create')
    @ApiOperation({ description: 'Add an ethereum account to  a user' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: EthereumAccountResponseDto })
    async checkAndCreateEthereumAccount(@Body() account: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.checkAndCreateAccount(account);
    }

    @Delete('account/ethereum/delete')
    @ApiOperation({ description: 'Delete an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: EthereumAccountResponseDto })
    async findOneAndDeleteEthereumAccount(@Body() account: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAndDeleteAccount(account);
    }

    @Post('account/discord/create')
    @ApiOperation({ description: 'Add a discord account to  a user' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: DiscordAccountResponseDto })
    async checkAndCreateDiscordAccount(@Body() account: DiscordAccountCreateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.checkAndCreateAccount(account);
    }

    @Delete('account/discord/delete')
    @ApiOperation({ description: 'Delete a discord account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: DiscordAccountResponseDto })
    async findOneAndDeleteDiscordAccount(@Body() account: DiscordAccountCreateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAndDeleteAccount(account);
    }
}