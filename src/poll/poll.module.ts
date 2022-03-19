import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollMongoService } from './poll.mongo.service';
import { Poll, PollSchema } from './poll.schema';
import { PollController } from './poll.controller';
import {SseModule} from "../sse/sse.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
        SseModule,
    ],
    controllers: [PollController],
    providers: [PollMongoService],
    exports: [MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }])],
})
export class PollModule {}