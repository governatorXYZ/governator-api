import {
    IsOptional,
    IsDate,
    IsArray,
    IsString,
    MaxLength,
    IsBoolean,
    MinDate, MaxDate, IsNumberString, IsMongoId,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class PollOptionsDto {
    _id: string;
    vote_option_name: string;
    vote_option_emoji: string;
}

export class CreatePollDto {

    @IsMongoId()
    @IsOptional()
    @ApiProperty({
        description: 'Poll ID - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @MaxLength(256)
    @ApiProperty({
        description: 'Poll title',
        required: true,
    })
        title: string;

    @IsNumberString()
    @ApiProperty({
        description: 'Discord channel to post this poll',
        required: true,
    })
        channel_id: string;

    @IsOptional()
    @ApiProperty({
        description: 'Poll options object',
        required: false,
    })
        poll_options: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Whether anyone is allowed to add poll options',
        required: false,
    })
        allow_options_for_anyone: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Whether a person can vote multiple times',
        required: false,
    })
        single_vote: boolean;

    @IsDate()
    @MinDate(new Date(Date.now() + 1000 * 60 * 60))
    @MaxDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
    @Transform(({ value }) => new Date(value), { toClassOnly: true })
    @ApiProperty({
        description: 'Time the voting period ends',
        required: true,
    })
        end_time: Date;

    @MaxLength(4096)
    @ApiProperty({
        description: 'Poll description',
        required: true,
    })
        description: string;

    @IsOptional()
    @IsArray()
    @IsString({
        each: true,
    })
    @ApiProperty({
        description: 'Whether voting is restricted to holders of certain discord roles',
        required: false,
    })
        role_restrictions: Array<string>;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID of poll author',
        required: true,
        default: new ObjectId(),
    })
        author_user_id: string;
}

export class UpdatePollDto extends PartialType(CreatePollDto) {}