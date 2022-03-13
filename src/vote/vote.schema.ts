import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { VoteRecordDto } from './vote.dto';

export type VoteDocument = Vote & Document;

@Schema({ collection: 'vote', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Vote {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true })
        poll_id: string;

    @Prop({ required: true })
        vote_record: VoteRecordDto;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);