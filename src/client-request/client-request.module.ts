import { Module } from '@nestjs/common';
import { ClientRequestController } from './client-request.controller';
import { SseModule } from '../sse/sse.module';

@Module({
    imports: [
        SseModule,
    ],
    controllers: [ClientRequestController],
})
export class ClientRequestModule {}