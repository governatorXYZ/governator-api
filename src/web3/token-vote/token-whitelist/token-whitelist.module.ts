import { Module } from '@nestjs/common';
import { TokenWhitelistMongoService } from './token-whitelist.mongo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenWhitelist, TokenWhitelistSchema } from './token-whitelist.schema';
import { TokenWhitelistController } from './token.whitelist.controller';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: TokenWhitelist.name, schema: TokenWhitelistSchema }]),
    ],
    controllers: [TokenWhitelistController],
    providers: [TokenWhitelistMongoService],
})
export class TokenWhitelistModule {}