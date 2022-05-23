import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountMongoService } from './account.mongo.service';
import { Account, AccountSchema } from './account.schema';
import { AccountController } from './account.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    ],
    controllers: [AccountController],
    providers: [AccountMongoService],
    exports: [AccountMongoService],
})
export class AccountModule {}
