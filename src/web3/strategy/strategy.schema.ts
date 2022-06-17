import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StrategyDocument = Strategy & Document;

@Schema({ collection: 'tokenStrategy', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Strategy {

    @Prop({ required: true })
        _id: string;

    @Prop({ required: true })
        name: string;

    @Prop({ required: true })
        endpoint: string;

    @Prop({ required: false })
        createdAt: string;

    @Prop({ required: false })
        updatedAt: string;
}

export const StrategySchema = SchemaFactory.createForClass(Strategy);