import { Module } from '@nestjs/common';
import { ClientRequestController } from './client-request.controller';
import { SseModule } from '../sse/sse.module';
import { ClientRequestService } from './client-request.service';

@Module({
    imports: [
        SseModule,
    ],
    providers: [ClientRequestService],
    controllers: [ClientRequestController],
})
export class ClientRequestModule {}