import {
    IsOptional,
    IsArray,
    IsString,
    MaxLength,
    IsNumberString,
    IsMongoId,
    IsNotEmpty,
    ValidateNested, IsIn, IsEthereumAddress, ArrayNotEmpty
} from 'class-validator';
import { ApiProperty, OmitType, PartialType, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import constants from '../common/constants';


export abstract class CommunityAdministratorBase {
    @IsNotEmpty()
    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'Provider id',
        required: true,
    })
        provider_id: string;
}

export class CommunityAdministratorDiscordDto extends CommunityAdministratorBase {

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord user IDs of the administrator',
        required: false,
        isArray: true,
    })
        user_allowlist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord role IDs of the administrator',
        required: false,
        isArray: true,
    })
        role_allowlist: string[];
}

export class CommunityAdministratorEthereumDto extends CommunityAdministratorBase {

    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @IsEthereumAddress({ each: true })
    @ApiProperty({
        description: 'Ethereum addesses of the administrator',
        required: true,
        isArray: true,
    })
        address_allowlist: string[];
}

export abstract class CommunityClientConfigBase extends CommunityAdministratorBase {
}

export class CommunityClientConfigDiscordDto extends CommunityAdministratorBase {

    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Discord server This config applies to',
        required: true,
    })
        guild_id: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord channel IDs of channels Governator is allowed to post in',
        required: false,
        isArray: true,
    })
        channel_allowlist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord channel IDs of channels Governator is NOT allowed to post in',
        required: false,
        isArray: true,
    })
        channel_denylist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord role IDs of members who are allowed to create governator polls',
        required: false,
        isArray: true,
    })
        role_allowlist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord role IDs of members who are NOT allowed to create governator polls',
        required: false,
        isArray: true,
    })
        role_denylist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord user IDs of members who are allowed to create governator polls',
        required: false,
        isArray: true,
    })
        user_allowlist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({},{each:true})
    @ApiProperty({
        description: 'Discord user IDs of members who are NOT allowed to create governator polls',
        required: false,
        isArray: true,
    })
        user_denylist: string[];
}

export class CommunityResponseDto {

    @IsMongoId()
    @IsOptional()
    @ApiProperty({
        description: 'Community ID - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @IsNotEmpty()
    @MaxLength(256)
    @ApiProperty({
        description: 'Community Name',
        required: true,
    })
        name: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CommunityAdministratorBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'provider_id',
            subTypes: [
                { value: CommunityAdministratorDiscordDto, name: 'discord' },
                { value: CommunityAdministratorEthereumDto, name: 'ethereum' },
            ],
        },
    })
    @ApiProperty({
        description: 'Administrators of this community',
        required: true,
        type: CommunityAdministratorBase,
        example: [
            { provider_id: 'discord', user_allowlist: ['NumberString'], role_allowlist: ['NumberString'] },
            { provider_id: 'ethereum', address_allowlist: ['EthAddress'] },
        ],
        isArray: true,
    })
        administrators: (CommunityAdministratorDiscordDto | CommunityAdministratorEthereumDto)[];
    
    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CommunityClientConfigBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'provider_id',
            subTypes: [
                { value: CommunityClientConfigDiscordDto, name: 'discord' },
            ],
        },
    })
    @ApiProperty({
        description: 'Client config for this community',
        required: true,
        type: CommunityClientConfigBase,
        example: [
            { 
                provider_id: 'discord',
                guild_id: 'NumberString',
                channel_allowlist: ['NumberString'],
                channel_denylist: ['NumberString'],
                role_allowlist: ['NumberString'],
                role_denylist: ['NumberString'],
                user_allowlist: ['NumberString'],
                user_denylist: ['NumberString']
            }
        ],
        isArray: true,
    })
        client_config: CommunityClientConfigDiscordDto[];

    // @IsNotEmpty()
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => AuthConfig)
    // @ApiProperty({
    //     description: '',
    //     required: false,
    //     type: AuthConfig,
    //     isArray: true,
    // })
    //     auth_config: AuthConfig[];

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

export class CommunityCreateDto extends OmitType(CommunityResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {}

export class CommunityUpdateDto extends PartialType(CommunityCreateDto) {}
