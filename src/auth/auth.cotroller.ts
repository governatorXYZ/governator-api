import { Controller, Get, Patch, Delete, UseGuards, Res, Param, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DiscordAuthGuard, IsAuthenticatedGuard } from '../auth/oauth-discord/oauth-discord.guard';
import { ApiKeyAdminAuthGuard } from './api-key/api-key.guard';
import { ApiKeyAuthService } from './api-key/api-key.service';
import { OauthSession } from './auth.dtos';
import { DiscordAuthService } from './oauth-discord/oauth-discord.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(
        private readonly apiKeyAuthService: ApiKeyAuthService,
        private readonly discordAuthService: DiscordAuthService,
        private readonly configService: ConfigService,
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

    @Get('auth/logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.logout(() => res.redirect(this.configService.get('FE_HOST')));
    }

    @Get('auth/redirect')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ description: 'Discord OAuth redirect url' })
    @ApiOkResponse({ description: 'Redirect' })
    async redirect(@Res() res: Response) {
        return res.redirect(this.configService.get('FE_HOST'));
    }

    @Get('auth/session')
    @UseGuards(IsAuthenticatedGuard)
    @ApiOkResponse({ description: 'Returns an Ethereum account object', type: OauthSession })
    async status(@Req() req: Request): Promise<OauthSession> {
        return req.user as OauthSession;
    }

    @Get('auth/discord/servers')
    @UseGuards(IsAuthenticatedGuard)
    @ApiOkResponse({ description: 'Returns a list of discord servers' })
    async listServers(@Req() req: Request) {
        return this.discordAuthService.getGuilds((req.user as OauthSession).oauthProfile);
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Patch('auth/create-key')
    async createApiKey() {
        return this.apiKeyAuthService.createApiKey();
    }

    @ApiSecurity('api_key')
    @UseGuards(ApiKeyAdminAuthGuard)
    @Delete('auth/delete-key:api_key')
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

