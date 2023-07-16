import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { VoteRawResponseUpdate } from './types';
import { IsIn, IsMongoId, IsOptional, IsString, IsUUID } from 'class-validator';
import constants from '../common/constants';
import { VoteDocument } from './vote.schema';
import { Types } from 'mongoose';

export class VoteByPollAggregate {
    aggregate: any[];
    votes: (VoteDocument & {
        _id: Types.ObjectId;
    })[];
}

export class VoteRawResponseDto {

    @IsMongoId()
    @IsOptional()
    @ApiProperty({
        description: 'Vote ID - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'ObjectId of Poll this Vote relates to',
        required: true,
        example: new ObjectId(),
    })
        poll_id: string;

    @IsUUID()
    @ApiProperty({
        description: 'Vote record object',
        required: true,
    })
        poll_option_id: string;

    @IsString()
    @ApiProperty({
        description: 'account ID',
        required: true,
    })
        account_id: string;

    @IsString()
    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'provider ID e.g. "ethereum" ',
        required: true,
    })
        provider_id: string;

    @IsString()
    @ApiProperty({
        description: 'Vote power - saved as string to allow for big numbers',
        required: true,
    })
        vote_power: string;

    @IsString()
    @ApiProperty({
        description: 'Datetime when record was created',
        required: false,
    })
        createdAt: string;

    @IsString()
    @ApiProperty({
        description: 'Datetime when record was last updated',
        required: false,
    })
        updatedAt: string;
}

export class VoteResponseDto {

    @IsString()
    @ApiProperty({
        description: 'POST method used (create, update or delete)',
        required: false,
        example: 'create',
    })
        method: string;

    @IsOptional()
    @ApiProperty({
        description: 'created/updated/deleted db object',
        required: false,
    })
        data: VoteRawResponseDto | VoteRawResponseUpdate;
}

export class VoteCreateDto extends OmitType(VoteRawResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {}

export class VoteRequestDto extends OmitType(VoteCreateDto, ['poll_id', 'vote_power'] as const) {}