import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type DiscordAccountDocument = DiscordAccount & Document;

@Schema({ collection: 'discordAccount', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class DiscordAccount {

    @Prop({ required: true, type: String })
        _id: string;

    @Prop({ required: true, auto: true, type: mongoose.Schema.Types.ObjectId })
        user_id: string;

    // e.g. discord, ethereum
    @Prop({ required: true, default: 'discord' })
        provider_id: string;

    @Prop({ required: true })
        discord_username: string;

    @Prop({ required: true })
        discriminator: string;
    
    @Prop({ required: true })
        avatar: string;
    
    @Prop({ required: true })
        accessToken: string;

    @Prop({ required: true })
        refreshToken: string;
}

export const DiscordAccountSchema = SchemaFactory.createForClass(DiscordAccount);