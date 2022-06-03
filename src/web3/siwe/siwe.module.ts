import { Module } from '@nestjs/common';
import { SiweService } from './siwe.service';
import { SiweController } from './siwe.controller';
import { AccountModule } from '../../account/account.module';


@Module({
    imports: [AccountModule],
    controllers: [SiweController],
    providers: [SiweService],
})
export class SiweModule {}