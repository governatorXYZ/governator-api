import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollMongoService } from './poll.mongo.service';
import { Poll, PollSchema } from './poll.schema';
import { PollController } from './poll.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    ],
    controllers: [PollController],
    providers: [PollMongoService],
})
export class PollModule {}