import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DiscordAuthGuard, IsAuthenticatedGuard } from 'src/auth/oauth-discord.guard';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(
    ) {
        // do nothing
    }

    @Get('auth/login')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ description: 'Discord oauth login url' })
    @ApiOkResponse({ description: 'Logging in via discord..' })
    async login() {
        return;
    }

    @Get('auth/redirect')
    @UseGuards(DiscordAuthGuard)
    @ApiOperation({ description: 'Discord redirect url' })
    @ApiOkResponse({ description: 'Redirecting..' })
    async redirect(@Res() res: Response) {
        return res.sendStatus(200);
    }

    @Get('auth/status')
    @UseGuards(IsAuthenticatedGuard)
    async status() {
        return 'ok';
    }
}