import { Module } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';
import { SnapshotController } from './snapshot.controller';

@Module({
    controllers: [SnapshotController],
    providers: [SnapshotService],
    exports: [SnapshotService],
})
export class SnapshotModule {}