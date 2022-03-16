import { IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateVoteDto {

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
    })
        poll_id: string;

    @ApiProperty({
        description: 'Vote record object',
        required: true,
        // type: VoteOptionDto,
    })
        poll_option_index: number;

    @ApiProperty({
        description: 'Provider ID of requesting platform, e.g. discord',
        required: true,
        // TODO: create common enum SupportedProviders
        // type: SupportedProviders,
    })
        provider_id: string;

    @ApiProperty({
        description: 'Provider account ID of requesting platform, e.g. discord user ID',
        required: true,
    })
        provider_account_id: string;
}

export class VoteRequestDto extends OmitType(CreateVoteDto, ['provider_id', 'poll_id'] as const) {}

export class VoteRawResponseDto {

    @ApiProperty({
        description: 'Vote ID - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @ApiProperty({
        description: 'ObjectId of Poll this Vote relates to',
        required: true,
    })
        poll_id: string;

    @ApiProperty({
        description: 'Vote record object',
        required: false,
        // type: VoteOptionDto,
    })
        poll_option_index: number;

    @ApiProperty({
        description: 'Provider ID of requesting platform, e.g. discord',
        required: false,
        // TODO: create common enum SupportedProviders
        // type: SupportedProviders,
    })
        provider_id: string;

    @ApiProperty({
        description: 'Provider account ID of requesting platform, e.g. discord user ID',
        required: false,
    })
        provider_account_id: string;

    @ApiProperty({
        description: 'Datetime when record was created',
        required: false,
    })
        createdAt: string;

    @ApiProperty({
        description: 'Datetime when record was last updated',
        required: false,
    })
        updatedAt: string;
}

export class VoteResponseDto {

    @ApiProperty({
        description: 'POST method used (create, update or delete)',
        required: false,
        example: 'create',
    })
        method: string;

    @ApiProperty({
        description: 'created/updated/deleted db object',
        required: false,
    })
        data: VoteRawResponseDto;
}