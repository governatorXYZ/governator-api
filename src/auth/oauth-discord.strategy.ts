import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Strategy, { Profile } from 'passport-discord';
import { AuthProvider } from './auth';


@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authService: AuthProvider,
    ) {
        super(
            {
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: process.env.DISCORD_CALLBACK_URL,
                scope: ['identify', 'guilds'],
            },
        );
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {

        const { username, discriminator, id: discordId, avatar } = profile;

        const details = { username, discriminator, discordId, avatar };

        return await this.authService.validateUser(details);


        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile.username);
        // console.log(cb(null, profile));
        // cb: (err, user) => Record<string, unknown>
       
        // done(new UnauthorizedException(), null);
    };
}