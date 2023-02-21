import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './api-key.strategy';
import { ConfigModule } from '@nestjs/config';
import { DiscordStrategy } from './oauth-discord.strategy';
import { AuthController } from './auth.cotroller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './serializer';

@Module({
    imports: [PassportModule, ConfigModule],
    providers: [
        ApiKeyStrategy,
        DiscordStrategy,
        SessionSerializer,
        {
            provide: 'AUTH_SERVICE',
            useClass: AuthService,
        },
    ],
    controllers: [AuthController],
})
export class AuthModule {}