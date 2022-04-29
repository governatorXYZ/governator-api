import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ collection: 'account', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Account {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
        user_id: string;

    // @Prop({ required: true })
    //     provider_type: string;

    @Prop({ required: true })
        provider_id: string;

    @Prop({ required: true })
        provider_account_id: string;

    // @Prop({ required: false })
    //     refresh_token: string;

    // @Prop({ required: false })
    //     access_token: string;

    // @Prop({ required: false, type: mongoose.Schema.Types.Date })
    //     access_token_expires: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);