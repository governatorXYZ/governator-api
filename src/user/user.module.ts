import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AccountModule } from '../account/account.module';
import { UserController } from './user.controller';

@Module({
    imports: [AccountModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}