import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Token } from '../../web3.dtos';

export type TokenWhitelistDocument = TokenWhitelist & Document;

@Schema({ collection: 'tokenWhitelist', toObject: { getters: true }, optimisticConcurrency: true, timestamps: true })
export class TokenWhitelist {

    @Prop({ required: true, type: Token })
        _id: Token;

    @Prop({ required: true })
        erc: number;

    @Prop({ required: false })
        createdAt: string;

    @Prop({ required: false })
        updatedAt: string;
}

export const TokenWhitelistSchema = SchemaFactory.createForClass(TokenWhitelist);