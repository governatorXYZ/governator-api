import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ collection: 'account', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Account {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
        user_id: string;

    // e.g. discord, ethereum_mainnet
    @Prop({ required: true })
        provider_id: string;


    @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
        provider_account: mongoose.Schema.Types.Mixed;
}

export const AccountSchema = SchemaFactory.createForClass(Account);