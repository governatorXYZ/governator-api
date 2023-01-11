import { Logger, Module, HttpStatus, forwardRef, CACHE_MANAGER } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommunityMongoService } from './community.mongo.service';
import { Community, CommunitySchema, CommunityDocument } from './community.schema';
import { CommunityController } from './community.controller';
import { CommunityClientConfigDiscordDto } from './community.dtos';
import { Cache } from 'cache-manager';
import { existsSync } from 'fs';


@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Community.name,
                useFactory: () => {
                    const schema = CommunitySchema;

                    const logger = new Logger('MongooseModuleCommunity');

                    schema.pre<Community>('validate', async function() {
                        logger.log('Running mongoose pre-validate hook');
                        try {
                            // We fetch document with same guild_id in CommunityClientConfigDiscord from db
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
                            
                            // if the document exists we have a duplicate entry and should not allow it to be saved
                            if (exists) {

                                logger.error(
                                    `Duplicate discord guild ID found in community config.
                                    EXISTING Community object_id: ${exists._id}
                                    with discord client config: ${JSON.stringify(exists.client_config.find((config) => config.provider_id === 'discord'))}.
                                    NEW Community object_id: ${this._id}
                                    with discord client config: ${JSON.stringify(this.client_config.find((config) => config.provider_id === 'discord'))}.
                                    Triggering duplicate key error.`);
                                
                                // since there seems to be no way to cancel the transaction or to update the validation function
                                // we update the new documents ID to equal existing documents ID which will trigger a validation 
                                // error and prevent document from being saved.
                                // @ts-ignore
                                this.set('_id', exists._id);
                            }

                        } catch (err) {
                            logger.log('No conflicting documents found, commencing validation.');
                        }
                    });

                    return schema;
                },
                // inject: [CACHE_MANAGER],
            },
        ]),
    ],
    controllers: [CommunityController],
    providers: [CommunityMongoService],
    exports: [CommunityMongoService],
})
export class CommunityModule {}