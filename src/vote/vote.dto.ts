import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { VoteRawResponseUpdate } from './types';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

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

    @IsString()
    @ApiProperty({
        description: 'Vote record object',
        required: true,
    })
        poll_option_id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID',
        required: true,
    })
        user_id: string;

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

export class VoteRequestDto extends OmitType(VoteCreateDto, ['poll_id'] as const) {}