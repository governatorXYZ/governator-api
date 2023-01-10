import { HttpException, Module, HttpStatus, forwardRef } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommunityMongoService } from './community.mongo.service';
import { Community, CommunitySchema, CommunityDocument } from './community.schema';
import { CommunityController } from './community.controller';
import { CommunityClientConfigDiscordDto } from './community.dtos';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Community.name,
                useFactory: () => {
                    const schema = CommunitySchema;
          
                    schema.pre<Community>('save', async function() {
                        console.log('here0');
                        try {
                            console.log('here1');
                            console.log(this.client_config.find((config) => config.provider_id === 'discord'));
                            // const exists = await communityModel.fetchCommunityByDiscordGuildId((this.client_config.find((config) => config.provider_id === 'discord') as CommunityClientConfigDiscordDto).guild_id);
// @ts-ignore
                            const exists = await this.constructor.findOne(
                                {
                                    client_config: {
                                        '$elemMatch': {
                                            provider_id: 'discord',
                                            guild_id: (this.client_config.find((config) => config.provider_id === 'discord') as CommunityClientConfigDiscordDto).guild_id,
                                        },
                                    },
                                },
                            ).exec();

                            console.log(exists);

                            if (exists) {
                                throw new Error;
                            }

                        } catch (err) {
                            // do nothing
                        }
                    });

                    return schema;
                },
                // inject: [CommunityMongoService],
            },
        ]),
    ],
    controllers: [CommunityController],
    providers: [CommunityMongoService],
    exports: [CommunityMongoService],
})
export class CommunityModule {}