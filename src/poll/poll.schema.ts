import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { StrategyConfig, PollOptionDto } from './poll.dtos';

export type PollDocument = Poll & Document;

@Schema({ collection: 'poll', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Poll {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true })
        title: string;

    @Prop({ required: false, type: Object })
        client_config: Record<string, any>;

    @Prop({ required: false, type: Array })
        poll_options: PollOptionDto[];

    @Prop({ required: false, type: Array })
        strategy_config: StrategyConfig[];

    @Prop({ required: false, default: false })
        allow_options_for_anyone: boolean;

    @Prop({ required: false, default: false })
        single_vote: boolean;

    @Prop({ required: true, type: mongoose.Schema.Types.Date })
        end_time: Date;

    @Prop({ required: true })
        description: string;

    @Prop({ required: true })
        author_user_id: string;
}

export const PollSchema = SchemaFactory.createForClass(Poll);