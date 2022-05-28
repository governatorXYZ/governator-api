import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    DiscordAccountCreateDto,
    DiscordAccountResponseDto,
    DiscordAccountUpdateDto,
    DiscordAccountValidateAccountIdDto,
    DiscordAccountValidateUserIdDto,
    EthereumAccountCreateDto,
    EthereumAccountResponseDto,
    EthereumAccountUpdateUserDto,
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

    @Get('account/ethereum/get-by-user-id/:user_id')
    @ApiOperation({ description: 'Find Ethereum accounts' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object array', type: EthereumAccountResponseDto, isArray: true })
    @ApiParam({ name: 'user_id', description: 'Governator user ID' })
    async findOneEthereumAccountByUserId(@Param() params: EthereumAccountUpdateUserDto): Promise<EthereumAccount[]> {
        return await this.ethereumMongoService.findManyAccount({ user_id: params.user_id });
    }

    @Get('account/ethereum/get-by-account-id/:_id')
    @ApiOperation({ description: 'Find an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns an Ethereum account object', type: EthereumAccountResponseDto })
    @ApiParam({ name: '_id', description: 'Ethereum address' })
    async findOneEthereumAccountByProviderAccountId(@Param() params: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAccount({ _id: params._id });
    }

    @Post('account/ethereum/create')
    @ApiOperation({ description: 'Create an unverified ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: EthereumAccountResponseDto })
    async checkAndCreateEthereumAccount(@Body() ethAccount: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.checkAndCreateAccount(ethAccount._id);
    }

    @Put('account/ethereum/update/:_id')
    @ApiOperation({ description: 'Update an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the updated account object', type: EthereumAccountResponseDto })
    async findByIdAndUpdateEthereumAccount(@Param() params: EthereumAccountCreateDto, @Body() ethAccount: EthereumAccountUpdateUserDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAndUpdateAccount({ _id: params._id }, ethAccount);
    }

    @Delete('account/ethereum/delete/:_id')
    @ApiOperation({ description: 'Delete an ethereum account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: EthereumAccountResponseDto })
    @ApiParam({ name: '_id', description: 'Ethereum address' })
    async findOneAndDeleteEthereumAccount(@Param() params: EthereumAccountCreateDto): Promise<EthereumAccount> {
        return await this.ethereumMongoService.findOneAndDeleteAccount({ _id: params._id });
    }


    // Discord accounts

    @Get('account/discord/list')
    @ApiOperation({ description: 'List all Discord accounts' })
    @ApiCreatedResponse({ description: 'Returns an Discord account object', type: DiscordAccountResponseDto, isArray: true })
    async findManyDiscordAccount(): Promise<DiscordAccount[]> {
        return await this.discordMongoService.findManyAccount({});
    }


    @Get('account/discord/get-by-user-id/:user_id')
    @ApiOperation({ description: 'Find discord accounts by governator id' })
    @ApiCreatedResponse({ description: 'Returns a Discord account object', type: DiscordAccountResponseDto, isArray: true })
    @ApiParam({ name: 'user_id', description: 'Governator ID' })
    async findOneDiscordAccountByUserId(@Param() params: DiscordAccountValidateUserIdDto): Promise<DiscordAccount[]> {
        return await this.discordMongoService.findManyAccount({ user_id: params.user_id });
    }

    @Get('account/discord/get-by-account-id/:_id')
    @ApiOperation({ description: 'Find a discord account' })
    @ApiCreatedResponse({ description: 'Returns a Discord account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: '_id', description: 'Discord user ID' })
    async findOneDiscordAccountByProviderAccountId(@Param() params: DiscordAccountValidateAccountIdDto): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAccount({ _id: params._id });
    }

    @Post('account/discord/create')
    @ApiOperation({ description: 'Create a discord account' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: DiscordAccountResponseDto })
    async checkAndCreateDiscordAccount(@Body() account: DiscordAccountCreateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.checkAndCreateAccount(account);
    }

    @Put('account/discord/update/:_id')
    @ApiOperation({ description: 'Update a discord account' })
    @ApiCreatedResponse({ description: 'Returns the updated account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: '_id', description: 'Discord account ID' })
    async findByIdAndUpdateDiscordAccount(@Param() params: DiscordAccountValidateAccountIdDto, @Body() discordAccount: DiscordAccountUpdateDto): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAndUpdateAccount({ _id: params._id }, discordAccount);
    }

    @Delete('account/discord/delete/:_id')
    @ApiOperation({ description: 'Delete a discord account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: DiscordAccountResponseDto })
    @ApiParam({ name: '_id', description: 'Discord account ID' })
    async findOneAndDeleteDiscordAccount(@Param() params: DiscordAccountValidateAccountIdDto): Promise<DiscordAccount> {
        return await this.discordMongoService.findOneAndDeleteAccount({ _id: params._id });
    }
}