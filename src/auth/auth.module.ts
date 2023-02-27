import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy, ApiKeyStrategyAdmin } from './api-key/api-key.strategy';
import { ConfigModule } from '@nestjs/config';
import { DiscordStrategy } from './oauth-discord/oauth-discord.strategy';
import { AuthController } from './auth.cotroller';
import { DiscordAuthService } from './oauth-discord/oauth-discord.service';
import { SessionSerializer } from './oauth-discord/serializer';
import { AuthMongoService } from './auth.mongo.service';
import { Auth, AuthSchema } from './auth.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyAuthService } from './api-key/api-key.service';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        PassportModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
        AccountModule,
        UserModule,
    ],
    providers: [
        ApiKeyStrategy,
        ApiKeyStrategyAdmin,
        DiscordStrategy,
        SessionSerializer,
        DiscordAuthService,
        ApiKeyAuthService,
        AuthMongoService,
    ],
    controllers: [AuthController],
})
export class AuthModule {}