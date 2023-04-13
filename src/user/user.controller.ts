import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './user.dtos';
import constants from '../common/constants';
import { ApiKeyAuthGuard } from '../auth/api-key/api-key.guard';

@ApiTags('User')
@ApiSecurity('api_key')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class UserController {
    constructor(protected userService: UserService) {
        // do nothing
    }

    @Get('user/list')
    @ApiOperation({ description: 'Fetch all users' })
    @ApiOkResponse({ description: 'List of User objects', type: UserResponseDto, isArray: true })
    async fetchAllUsers() {
        return await this.userService.fetchAllUsers();
    }

    @Get('user/:user_id')
    @ApiOperation({ description: 'Fetch user by ID' })
    @ApiParam({ name: 'user_id', description: 'Get user by ID' })
    @ApiOkResponse({ description: 'User object', type: UserResponseDto })
    async fetchUserById(@Param('user_id') userId) {
        return await this.userService.fetchUserById(userId);
    }

    @Get('user/:provider_id/:account_id')
    @ApiOperation({ description: 'Fetch user by account' })
    @ApiParam({
        description: 'ID of account provider',
        type: String,
        name:'provider_id',
        enum: Array.from(constants.PROVIDERS.keys()),
    })
    @ApiParam({ name: 'account_id', description: 'Account ID, e.g. discord user ID' })
    @ApiOkResponse({ description: 'User object', type: UserResponseDto })
    async fetchUserByProvider(@Param('provider_id') providerId, @Param('account_id') accountId) {
        return await this.userService.fetchUserByProvider(providerId, accountId);
    }
}