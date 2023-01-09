import { Module } from '@nestjs/common';
import { ClientRequestController } from './client-request.controller';
import { SseModule } from '../sse/sse.module';
import { ClientRequestService } from './client-request.service';
import { CommunityModule } from 'src/community/community.module';

@Module({
    imports: [
        SseModule,
        CommunityModule,
    ],
    providers: [ClientRequestService],
    controllers: [ClientRequestController],
})
export class ClientRequestModule {}