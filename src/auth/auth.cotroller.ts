import { Controller, Get, UseGuards, Res, Param, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DiscordAuthGuard, IsAuthenticatedGuard } from '../auth/oauth-discord/oauth-discord.guard';
import { ApiKeyAdminAuthGuard } from './api-key/api-key.guard';
import { ApiKeyAuthService } from './api-key/api-key.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(
        private readonly apiKeyAuthService: ApiKeyAuthService,
    ) {
        // do nothing
    }

    @Get('auth/login')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ description: 'Discord OAuth login url' })
    @ApiOkResponse({ description: 'Logging in via discord..' })
    async login() {
        return;
    }

    @Get('auth/redirect')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ description: 'Discord OAuth redirect url' })
    @ApiOkResponse({ description: 'Redirecting..' })
    async redirect(@Res() res: Response) {
        return res.sendStatus(200);
    }

    @Get('auth/status')
    @ApiSecurity('api_key')
    @UseGuards(IsAuthenticatedGuard)
    async status(@Req() req: Request) {
        return req.user;
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Get('auth/create-key')
    async createApiKey() {
        return this.apiKeyAuthService.createApiKey();
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Get('auth/delete-key:api_key')
    @ApiParam({ name: 'api_key', description: 'Key to be deleted' })
    async deleteApiKey(@Param() params) {
        return this.apiKeyAuthService.deleteApiKey(params.api_key);
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Get('auth/get-keys')
    async getApiKeys() {
        return this.apiKeyAuthService.getApiKeys();
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Get('auth/validate-key:api_key')
    @ApiParam({ name: 'api_key', description: 'Key to be validated' })
    async validateApiKey(@Param() params) {
        return this.apiKeyAuthService.validateApiKey(params.api_key);
    }
}