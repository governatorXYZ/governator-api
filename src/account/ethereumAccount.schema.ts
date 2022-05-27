import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type EthereumAccountDocument = EthereumAccount & Document;

@Schema({ collection: 'ethereumAccount', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class EthereumAccount {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        user_id: string;

    // e.g. discord, ethereum
    @Prop({ required: true, default: 'ethereum' })
        provider_id: string;

    // ethereum address
    @Prop({ required: false })
        provider_account_id: string;

    // @Prop({ required: false })
    //     network_id: number;

    // @Prop({ required: true })
    //     chain_id: number;
    //
    // // Ethereum Mainnet
    // @Prop({ required: true })
    //     network_name: string;

    @Prop({ required: false })
        verification_message: string;

    @Prop({ required: false })
        signed_message: string;

    @Prop({ required: true, default: false })
        verified: boolean;
}

export const EthereumAccountSchema = SchemaFactory.createForClass(EthereumAccount);