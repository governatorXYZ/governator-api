import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityMongoService } from './community.mongo.service';
import { Community, CommunitySchema } from './community.schema';
import { CommunityController } from './community.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    ],
    controllers: [CommunityController],
    providers: [CommunityMongoService],
    exports: [CommunityMongoService],
})
export class CommunityModule {}