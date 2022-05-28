import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';
import { UserMongoService } from './user.mongo.service';
import { UserResponseDto } from './user.dtos';
import constants from "../common/constants";

@ApiTags('User')
@ApiSecurity('api_key')
@Controller()
export class UserController {
    constructor(protected mongoService: UserMongoService) {
        // do nothing
    }

    @Get('user/list')
    @ApiOperation({ description: 'Fetch all users' })
    @ApiOkResponse({ description: 'List of User objects', type: UserResponseDto, isArray: true })
    async fetchAllUsers() {
        return await this.mongoService.fetchAllUsers();
    }

    @Get('user/:user_id')
    @ApiOperation({ description: 'Fetch user by ID' })
    @ApiOkResponse({ description: 'User object', type: UserResponseDto })
    @ApiParam({ name: 'user_id', description: 'Get user by ID' })
    async fetchUserById(@Param('user_id') userId) {
        return await this.mongoService.fetchUserById(userId);
    }

    @Get('user/:provider_id/:account_id')
    @ApiOperation({ description: 'Fetch user by account' })
    @ApiOkResponse({ description: 'User object', type: UserResponseDto })
    @ApiParam({
        description: 'ID of account provider',
        type: String,
        name:'provider_id',
        enum: Array.from(constants.PROVIDERS.keys()),
    })
    @ApiParam({ name: 'account_id', description: 'Account ID, e.g. discord user ID' })
    async fetchUserByProvider(@Param('provider_id') providerId, @Param('account_id') accountId) {
        return await this.mongoService.fetchUserByProvider(providerId, accountId);
    }

    // TODO remove

    // @Post('user/create')
    // @ApiOperation({ description: 'Create a new user' })
    // @ApiCreatedResponse({ description: 'Returns the created user object', type: UserResponseDto })
    // async createUser(): Promise<User> {
    //     return await this.mongoService.createUser();
    // }

    // @Post('user/create-user-with-accounts')
    // @ApiOperation({ description: 'Create a new user and link an array of user accounts to it' })
    // @ApiCreatedResponse({ description: 'Returns the created user object', type: UserResponseDto })
    // async createUserWithAccounts(@Body() accounts: AccountUpdateDto[]): Promise<User> {
    //     return await this.mongoService.createUserWithAccounts(accounts);
    // }

    // @Put('user/:id/update')
    // @ApiParam({ name: 'id', description: 'Governator user ID of user to be updated' })
    // @ApiCreatedResponse({ description: 'Returns the updated user object', type: User })
    // async updateUser(@Param('id') id, @Body() user: UserUpdateDto): Promise<User> {
    //     return await this.mongoService.updateUser(id, user);
    // }
    //
    // @Delete('user/:id/delete')
    // @ApiParam({ name: 'id', description: 'Governator user ID of user to be deleted' })
    // @ApiCreatedResponse({ description: 'Returns the deleted user object', type: User })
    // async deleteUser(@Param('id') id): Promise<User> {
    //     return await this.mongoService.deleteUser(id);
    // }

}