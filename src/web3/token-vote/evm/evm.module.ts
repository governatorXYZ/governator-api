import { Module } from '@nestjs/common';
import { EvmController } from './evm.controller';
import { EvmService } from './evm.service';
import { AccountModule } from '../../../account/account.module';
import { TokenWhitelistModule } from '../token-whitelist/token-whitelist.module';


@Module({
    imports: [AccountModule, TokenWhitelistModule],
    controllers: [EvmController],
    providers: [EvmService],
    exports: [EvmService],
})
export class EvmModule {}