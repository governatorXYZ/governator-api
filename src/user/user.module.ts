import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserMongoService } from './user.mongo.service';
import { AccountModule } from '../account/account.module';
import { UserController } from './user.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AccountModule,
    ],
    controllers: [UserController],
    providers: [UserMongoService],
    exports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
})
export class UserModule {}