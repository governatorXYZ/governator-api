import { Module } from '@nestjs/common';
import { UserMongoService } from './user.mongo.service';
import { AccountModule } from '../account/account.module';
import { UserController } from './user.controller';

@Module({
    imports: [AccountModule],
    controllers: [UserController],
    providers: [UserMongoService],
    exports: [UserMongoService],
})
export class UserModule {}