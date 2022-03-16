import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserMongoService } from './user.mongo.service';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AccountModule,
    ],
    controllers: [],
    providers: [UserMongoService],
})
export class UserModule {}