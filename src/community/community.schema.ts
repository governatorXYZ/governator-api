import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { 
    CommunityAdministratorBase,
    CommunityClientConfigBase
} from './community.dtos'

export type CommunityDocument = Community & Document;

@Schema({ collection: 'community', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Community {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true })
        name: string;

    @Prop({ required: true, type: Object })
        administrators: CommunityAdministratorBase[];

    @Prop({ required: true, type: Object })
        client_config: CommunityClientConfigBase[];

    // @Prop({ required: true, type: Object })
    //     auth_config: AuthConfig[];
    
    // @Prop({ required: true })
    //     subscription: string;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);