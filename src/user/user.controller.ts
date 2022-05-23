import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserResponseDto, UserUpdateDto } from './user.dtos';
import { User } from './user.schema';
import { UserMongoService } from './user.mongo.service';
import { AccountUpdateDto } from '../account/account.dtos';

@ApiTags('User')
@ApiSecurity('api_key')
@Controller()
export class UserController {
    constructor(protected mongoService: UserMongoService) {
        // do nothing
    }

    @Get('user/list')
    @ApiOperation({ description: 'Fetch all users' })
    async fetchAllUsers() {
        return await this.mongoService.fetchAllUsers();
    }

    @Get('user/:id')
    @ApiOperation({ description: 'Fetch user by ID' })
    @ApiParam({ name: 'id', description: 'Get user by ID' })
    async fetchUserById(@Param('id') id) {
        return await this.mongoService.fetchUserById(id);
    }

    @Get('user/:provider_id/:provider_account_id')
    @ApiOperation({ description: 'Fetch user by provider' })
    @ApiParam({ name: 'provider_id', description: 'Provider ID, e.g. discord' })
    @ApiParam({ name: 'provider_account_id', description: 'Provider account ID, e.g. discord user ID' })
    async fetchUserByProvider(@Param('provider_id') provider_id, @Param('provider_account_id') provider_account_id) {
        return await this.mongoService.fetchUserByProvider(provider_id, provider_account_id);
    }

    @Post('user/create')
    @ApiOperation({ description: 'Create a new user' })
    @ApiCreatedResponse({ description: 'Returns the created user object', type: UserResponseDto })
    async createUser(): Promise<User> {
        return await this.mongoService.createUser();
    }

    @Post('user/create-user-with-accounts')
    @ApiOperation({ description: 'Create a new user and link an array of user accounts to it' })
    @ApiCreatedResponse({ description: 'Returns the created user object', type: UserResponseDto })
    async createUserWithAccounts(@Body() accounts: AccountUpdateDto[]): Promise<User> {
        return await this.mongoService.createUserWithAccounts(accounts);
    }

    @Put('user/:id/update')
    @ApiParam({ name: 'id', description: 'Governator user ID of user to be updated' })
    @ApiCreatedResponse({ description: 'Returns the updated user object', type: User })
    async updateUser(@Param('id') id, @Body() user: UserUpdateDto): Promise<User> {
        return await this.mongoService.updateUser(id, user);
    }

    @Delete('user/:id/delete')
    @ApiParam({ name: 'id', description: 'Governator user ID of user to be deleted' })
    @ApiCreatedResponse({ description: 'Returns the deleted user object', type: User })
    async deleteUser(@Param('id') id): Promise<User> {
        return await this.mongoService.deleteUser(id);
    }

}