import { IsMongoId } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { PollOption } from './types';

export class VoteRecordDto {
    user_id: PollOption;
}

export class CreateVoteDto {

    @IsMongoId()
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
        type: VoteRecordDto,
    })
        vote_record: VoteRecordDto;

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
