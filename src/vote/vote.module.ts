import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { VoteController } from './vote.controller';
import { VoteMongoService } from './vote.mongo.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
    ],
    controllers: [VoteController],
    providers: [VoteMongoService],
})
export class VoteModule {}