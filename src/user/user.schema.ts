import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'user', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class User {
    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        _id: string;

    @Prop({ required: true })
        name: string;

    @Prop({ required: false })
        image: string;

    @Prop({ required: false })
        email: string;

    @Prop({ required: false })
        emailVerified: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
