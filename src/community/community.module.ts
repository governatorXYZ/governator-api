import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityMongoService } from './community.mongo.service';
import { Community, CommunitySchema } from './community.schema';
import { CoummunityController } from './community.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    ],
    controllers: [CoummunityController],
    providers: [CommunityMongoService],
})
export class PollModule {}