import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { DiscordAccountUpdateDto } from 'src/account/account.dtos';
import { DiscordAuthService } from './oauth-discord.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly authService: DiscordAuthService) {
        super();
    }

    serializeUser(discordAccount: DiscordAccountUpdateDto, done: (err: Error, usr: any) => void) {
        done(null, discordAccount);
    }

    async deserializeUser(payload: any, done: (err: Error, user: any) => void) {
        // const user = await this.authService.getUser(payload);
        done(null, payload);
    }
}