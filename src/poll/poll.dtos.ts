import {
    IsOptional,
    IsDate,
    IsArray,
    IsString,
    MaxLength,
    IsBoolean,
    MaxDate,
    IsNumberString,
    IsMongoId,
    IsNotEmpty,
    ValidateNested, ArrayMaxSize, IsIn, IsUUID, IsNumber,
} from 'class-validator';
import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import constants from '../common/constants';
import { IsAfterNow } from '../common/isAfterNowConstraint';
import { DiscordEmbedFieldLength } from './discordEmbedFieldLengthConstraint';

// Maximum number of fields to be used by poll_options and role_restrictions combined
// Discord limit is 25, leaving 5 fields for date, vote count, strategy name, and misc
const MAX_EMBED_FIELD_LENGTH = 20;

export class PollOptionDto {
    @IsNotEmpty()
    @IsUUID()
    @ApiProperty({
        description: 'Poll option unique id',
        required: true,
    })
        poll_option_id: string;

    @IsNotEmpty()
    @MaxLength(250)
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
        description: 'Server to post in',
        required: true,
    })
        guild_id: string;

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
        example: [{
            provider_id: 'discord',
            channel_id: 'Snowflake',
            message_id: 'Snowflake',
            role_restrictions: ['Snowflake'],
        }],
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

    // TODO: Bot can only have 5 buttons per ActionRow. Supporting > 5 will require bot code refactor
    @ArrayMaxSize(5, { message: 'Currently only 5 poll_options are supported' })
    @DiscordEmbedFieldLength('client_config', MAX_EMBED_FIELD_LENGTH)
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

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        description: 'Whether a person can vote multiple times',
        required: false,
    })
        single_vote: boolean;

    @IsDate()
    @IsAfterNow()
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
