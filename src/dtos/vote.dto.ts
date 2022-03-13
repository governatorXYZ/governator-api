import { IsMongoId } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { PollOption } from '../types/types';

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

}

export class UpdateVoteDto extends PartialType(CreateVoteDto) {}