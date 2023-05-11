import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({ collection: 'auth', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class Auth {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true, unique: true })
        api_key_hashes: string[];
}

export const AuthSchema = SchemaFactory.createForClass(Auth);