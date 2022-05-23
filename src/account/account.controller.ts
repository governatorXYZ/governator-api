import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Account } from './account.schema';
import { AccountCreateDto } from './account.dtos';
import { AccountMongoService } from './account.mongo.service';


@ApiTags('Account')
@ApiSecurity('api_key')
@Controller()
export class AccountController {
    constructor(protected mongoService: AccountMongoService) {
        // do nothing
    }

    @Post('account/create')
    @ApiOperation({ description: 'Add a provider account to  a user' })
    @ApiCreatedResponse({ description: 'Returns the new account object', type: AccountCreateDto })
    async checkAndCreateAccount(@Body() account: AccountCreateDto): Promise<Account> {
        return await this.mongoService.checkAndCreateAccount(account);
    }

    @Delete('account/delete')
    @ApiOperation({ description: 'Delete a provider account' })
    @ApiCreatedResponse({ description: 'Returns the deleted account object', type: Account })
    async findOneAndDeleteAccount(@Body() account: AccountCreateDto): Promise<Account> {
        return await this.mongoService.findOneAndDeleteAccount(account);
    }
}