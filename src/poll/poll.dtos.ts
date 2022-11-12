import {
    IsOptional,
    IsDate,
    IsArray,
    IsString,
    MaxLength,
    IsBoolean,
    MinDate,
    MaxDate,
    IsNumberString,
    IsMongoId,
    IsNotEmpty,
    ValidateNested, ArrayMaxSize, IsIn, IsUUID, IsNumber,
} from 'class-validator';
import {ApiProperty, OmitType, PartialType, PickType} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import constants from '../common/constants';

export class PollOptionDto {
    @IsNotEmpty()
    @IsUUID()
    @ApiProperty({
        description: 'Poll option unique id',
        required: true,
    })
        poll_option_id: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Poll option id',
        required: true,
    })
        poll_option_name: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Poll option emoji',
        required: true,
    })
        poll_option_emoji: string;
}

export abstract class ClientConfigBase {
    @IsNotEmpty()
    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'Provider id',
        required: true,
    })
        provider_id: string;
}

export class ClientConfigDiscordDto extends ClientConfigBase {

    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Channel to post in',
        required: true,
    })
        channel_id: string;

    @IsNumberString()
    @IsOptional()
    @ApiProperty({
        description: 'Message ID of poll once posted',
        required: false,
        default: '0',
    })
        message_id: string;

    @IsOptional()
    @IsNumberString({}, { each: true })
    @IsArray()
    @ApiProperty({
        description: 'Whitelist of role Ids',
        required: false,
        isArray: true,
    })
        role_restrictions: string[];
}

export class StrategyConfig {
    @IsNotEmpty()
    @IsIn(constants.STRATEGY_TYPES)
    @ApiProperty({
        description: 'Strategy type',
        required: true,
    })
        strategy_type: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Strategy id',
        required: true,
    })
        strategy_id: string;

    @IsNumber()
    @ApiProperty({
        description: 'Block height (block number or offset)',
        required: true,
    })
        block_height: number;
}

export class StrategyConfigCreate extends PickType(StrategyConfig, ['strategy_id', 'block_height'] as const) {
    @IsOptional()
    @IsIn(constants.STRATEGY_TYPES)
    @ApiProperty({
        description: 'Strategy type',
        required: false,
    })
        strategy_type: string;

}


export class PollResponseDto {

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

    @ValidateNested({ each: true })
    @Type(() => ClientConfigBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'provider_id',
            subTypes: [
                { value: ClientConfigDiscordDto, name: 'discord' },
            ],
        },
    })
    @ApiProperty({
        description: 'Client config for this poll',
        required: true,
        type: ClientConfigBase,
        example: [{ provider_id: 'discord', channel_id: '12345', message_id: '12345', role_restrictions: ['123', '234'] }],
        isArray: true,
    })
        client_config: ClientConfigDiscordDto[];

    @IsNotEmpty()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => StrategyConfig)
    @ApiProperty({
        description: 'Array of strategy configs',
        required: false,
        type: StrategyConfig,
        isArray: true,
    })
        strategy_config: StrategyConfig[];

    @ArrayMaxSize(8)
    @ValidateNested({ each: true })
    @Type(() => PollOptionDto)
    @ApiProperty({
        description: 'Poll options object',
        required: false,
        type: PollOptionDto,
        isArray: true,
    })
        poll_options: PollOptionDto[];

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

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID of poll author',
        required: true,
        default: new ObjectId(),
    })
        author_user_id: string;

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

export class PollCreateDto extends OmitType(PollResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {
    @IsNotEmpty()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => StrategyConfigCreate)
    @ApiProperty({
        description: 'Array of strategy configs',
        required: false,
        type: StrategyConfigCreate,
        isArray: true,
    })
        strategy_config: StrategyConfigCreate[];
}

export class PollUpdateDto extends PartialType(PollCreateDto) {}
