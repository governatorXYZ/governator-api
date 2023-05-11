import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy, { Profile } from 'passport-discord';
import { DiscordAuthService } from './oauth-discord.service';
import { OauthSession } from '../auth.dtos';


@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(
        private readonly authService: DiscordAuthService,
    ) {
        super(
            {
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: process.env.DISCORD_CALLBACK_URL,
                scope: process.env.DISCORD_OAUTH_SCOPES.split(','),
            },
        );
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<OauthSession> {

        const { username: discord_username, discriminator, id: _id, avatar, provider: provider_id } = profile;

        const discordUser = { discord_username, discriminator, _id, avatar, provider_id, accessToken, refreshToken };

        return await this.authService.validateUser(discordUser);
    }
}