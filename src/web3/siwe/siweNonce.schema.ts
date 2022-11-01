import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type SiweNonceDocument = SiweNonce & Document;

@Schema({ collection: 'siweNonce', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class SiweNonce {

    @Prop({ required: true, type: String })
        _id: string;

    @Prop({ required: true, type: String })
        nonce: string;

    @Prop({ type: Date, expires: 60, default: Date.now })
        createdAt: string;
}

export const SiweNonceSchema = SchemaFactory.createForClass(SiweNonce);