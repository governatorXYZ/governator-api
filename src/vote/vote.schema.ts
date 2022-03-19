import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({ collection: 'vote', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Vote {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true })
        poll_id: string;

    @Prop({ required: true })
        poll_option_index: number;

    @Prop({ required: true })
        provider_id: string;

    @Prop({ required: true })
        provider_account_id: string;

    @Prop({ required: false })
        createdAt: string;

    @Prop({ required: false })
        updatedAt: string;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);