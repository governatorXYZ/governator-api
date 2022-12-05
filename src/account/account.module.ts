import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountController } from './account.controller';
import { EthereumAccount, EthereumAccountSchema } from './ethereumAccount.schema';
import { DiscordAccount, DiscordAccountSchema } from './discordAccount.schema';
import { EthereumAccountMongoService } from './ethereumAccount.mongo.service';
import { DiscordAccountMongoService } from './discordAccount.mongo.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: EthereumAccount.name, schema: EthereumAccountSchema }]),
        MongooseModule.forFeature([{ name: DiscordAccount.name, schema: DiscordAccountSchema }]),
    ],
    controllers: [AccountController],
    providers: [DiscordAccountMongoService, EthereumAccountMongoService],
    exports: [DiscordAccountMongoService, EthereumAccountMongoService],
})
export class AccountModule {}
