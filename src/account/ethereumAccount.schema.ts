import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type EthereumAccountDocument = EthereumAccount & Document;

@Schema({ collection: 'ethereumAccount', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class EthereumAccount {

    @Prop({ required: true, type: String })
        _id: string;

    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        user_id: string;

    // e.g. discord, ethereum
    @Prop({ required: true, default: 'ethereum' })
        provider_id: string;

    @Prop({ required: true })
        nonce: string;

    @Prop({ required: false })
        verification_message: string;

    @Prop({ required: false })
        signed_message: string;

    @Prop({ required: true, default: false })
        verified: boolean;
}

export const EthereumAccountSchema = SchemaFactory.createForClass(EthereumAccount);