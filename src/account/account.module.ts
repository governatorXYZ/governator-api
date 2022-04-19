import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountMongoService } from './account.mongo.service';
import { Account, AccountSchema } from './account.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    ],
    controllers: [],
    providers: [AccountMongoService],
    exports: [ MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])],
})
export class AccountModule {}
