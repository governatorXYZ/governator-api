import { forwardRef, Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [forwardRef(() => AccountModule)],
    controllers: [Web3Controller],
    providers: [Web3Service],
    exports: [Web3Service],
})
export class Web3Module {}