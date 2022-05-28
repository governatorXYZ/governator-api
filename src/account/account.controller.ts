import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    DiscordAccountCreateDto,
    DiscordAccountResponseDto, DiscordAccountUpdateDto,
    EthereumAccountCreateDto,
    EthereumAccountResponseDto, EthereumAccountUpdateDto,
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

    // Ethereum accounts

    @Get('account/ethereum/list')
    @ApiOperation({ description: 'List all Ethereum accounts' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object', type: EthereumAccountResponseDto, isArray: true })
    async findManyEthereumAccount(): Promise<EthereumAccount[]> {
        return await this.ethereumMongoService.findManyAccount({});
    }

    @Get('account/ethereum/get-many/:user_id')
    @ApiOperation({ description: 'Find Ethereum accounts' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object array', type: EthereumAccountResponseDto, isArray: true })
    @ApiParam({ name: 'user_id', description: 'Governator user ID' })
    async findOneEthereumAccountByUserId(@Param('user_id') userId): Promise<EthereumAccount[]> {
        return await this.ethereumMongoService.findManyAccount({ user_id: userId });
    }

    @Get('account/ethereum/get-one/:account_id')
    @ApiOperation({ description: 'Find an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object', type: EthereumAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Ethereum address' })
    async findOneEthereumAccountByProviderAccountId(@Param('account_id') accountId): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAccount({ _id: accountId });
    }

    @Post('account/ethereum/create')
    @ApiOperation({ description: 'Create an unverified ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: EthereumAccountResponseDto })
    async checkAndCreateEthereumAccount(@Body() account: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.checkAndCreateAccount(account);
    }

    @Put('account/ethereum/update/:account_id')
    @ApiOperation({ description: 'Update an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the updated account object', type: EthereumAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Ethereum address' })
    async findByIdAndUpdateEthereumAccount(@Param('account_id') ethAddress, @Body() ethAccount: EthereumAccountUpdateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAndUpdateAccount({ _id: ethAddress }, ethAccount);
    }

    @Delete('account/ethereum/delete/:account_id')
    @ApiOperation({ description: 'Delete an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: EthereumAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Ethereum address' })
    async findOneAndDeleteEthereumAccount(@Param('account_id') ethAddress): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAndDeleteAccount({ _id: ethAddress });
    }


    // Discord accounts

    @Get('account/discord/list')
    @ApiOperation({ description: 'List all Discord accounts' })
    @ApiCreatedResponse({ description: 'Returns an Discord account object', type: DiscordAccountResponseDto, isArray: true })
    async findManyDiscordAccount(): Promise<DiscordAccount[]> {
        return await this.discordMongoService.findManyAccount({});
    }


    @Get('account/discord/get-many/:user_id')
    @ApiOperation({ description: 'Find discord accounts by governator id' })
    @ApiCreatedResponse({ description: 'Returns a Discord account object', type: DiscordAccountResponseDto, isArray: true })
    @ApiParam({ name: 'user_id', description: 'Governator ID' })
    async findOneDiscordAccountByUserId(@Param('user_id') userId): Promise<DiscordAccount[]> {
        return await this.discordMongoService.findManyAccount({ user_id: userId });
    }

    @Get('account/discord/get-one/:account_id')
    @ApiOperation({ description: 'Find a discord account' })
    @ApiCreatedResponse({ description: 'Returns a Discord account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Discord user ID' })
    async findOneDiscordAccountByProviderAccountId(@Param('account_id') accountId): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAccount({ _id: accountId });
    }

    @Post('account/discord/create')
    @ApiOperation({ description: 'Create a discord account' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: DiscordAccountResponseDto })
    async checkAndCreateDiscordAccount(@Body() account: DiscordAccountCreateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.checkAndCreateAccount(account);
    }

    @Put('account/discord/update/:account_id')
    @ApiOperation({ description: 'Update a discord account' })
    @ApiCreatedResponse({ description: 'Returns the updated account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Discord account ID' })
    async findByIdAndUpdateDiscordAccount(@Param('account_id') discordId, @Body() discordAccount: DiscordAccountUpdateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAndUpdateAccount({ _id: discordId }, discordAccount);
    }

    @Delete('account/discord/delete/:account_id')
    @ApiOperation({ description: 'Delete a discord account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: 'account_id', description: 'Discord account ID' })
    async findOneAndDeleteDiscordAccount(@Param('account_id') discordId): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAndDeleteAccount({ _id: discordId });
    }
}