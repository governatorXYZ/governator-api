import { forwardRef, Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { AccountModule } from '../account/account.module';
import { SnapshotService } from './snapshot.service';
import { SnapshotController } from './snapshot.controller';

@Module({
    imports: [forwardRef(() => AccountModule)],
    controllers: [Web3Controller, SnapshotController],
    providers: [Web3Service, SnapshotService],
    exports: [Web3Service],
})
export class Web3Module {}