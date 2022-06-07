import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';
import { UserMongoService } from './user.mongo.service';
import { UserResponseDto } from './user.dtos';
import constants from '../common/constants';

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
}