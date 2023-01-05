import {
    IsOptional,
    IsArray,
    IsString,
    MaxLength,
    IsNumberString,
    IsMongoId,
    IsNotEmpty,
    ValidateNested, IsIn, IsEthereumAddress, ArrayNotEmpty, IsHash,
} from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
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
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord user IDs of the administrator',
        required: false,
        isArray: true,
    })
        user_allowlist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
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

export class CommunityClientConfigDiscordDto extends CommunityClientConfigBase {

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
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord channel IDs of channels Governator is allowed to post in',
        required: false,
        isArray: true,
    })
        channel_allowlist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord channel IDs of channels Governator is NOT allowed to post in',
        required: false,
        isArray: true,
    })
        channel_denylist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord role IDs of members who are allowed to create governator polls',
        required: false,
        isArray: true,
    })
        role_allowlist: string[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord role IDs of members who are NOT allowed to create governator polls',
        required: false,
        isArray: true,
    })
        role_denylist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord user IDs of members who are allowed to create governator polls',
        required: false,
        isArray: true,
    })
        user_allowlist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each:true })
    @ApiProperty({
        description: 'Discord user IDs of members who are NOT allowed to create governator polls',
        required: false,
        isArray: true,
    })
        user_denylist: string[];
}


export abstract class EthereumValidationBase {
    @IsNotEmpty()
    @IsEthereumAddress()
    @ApiProperty({
        description: 'Contract address to use for ownership validation',
        required: true,
    })
        address: string;

    @IsNotEmpty()
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each: true })
    @ApiProperty({
        description: 'What chains to include when checking',
        required: true,
    })
        chain_ids: string[];
}

class BalanceOf extends EthereumValidationBase {
       
    @IsOptional()
    @IsNotEmpty()
    @IsNumberString()
    @ApiProperty({
        description: 'Minimum balance in wei (as string) - constract must implement ERC-20 balanceOf',
        required: false,
    })
        balance_threshold: string;
}

class OwnerOf extends EthereumValidationBase {
    
    @IsArray()
    @ArrayNotEmpty()
    @IsNumberString({}, { each: true })
    @ApiProperty({
        description: 'List of token Ids to validate - contract must implement ERC-721 ownerOf',
        required: true,
    })
        token_ids: string[];
}

export class CommunityClientConfigEthereumDto extends CommunityClientConfigBase {

    @IsNotEmpty()
    @IsEthereumAddress()
    @ApiProperty({
        description: 'Ethereum community address (e.g. DAO multisig or owner address)',
        required: true,
    })
        address: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEthereumAddress({ each:true })
    @ApiProperty({
        description: 'Addresses allowed to create polls',
        required: false,
        isArray: true,
    })
        address_allowlist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEthereumAddress({ each:true })
    @ApiProperty({
        description: 'Addresses NOT allowed to create polls',
        required: false,
        isArray: true,
    })
        address_denylist: string[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EthereumValidationBase, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'address',
            subTypes: [
                { value: BalanceOf, name: 'BalanceOf' },
                { value: OwnerOf, name: 'OwnerOf' },
            ],
        },
    })
    @ApiProperty({
        description: 'Validation criteria to give permission to create contracts',
        required: false,
        type: CommunityAdministratorBase,
        example: [
            { address: 'EthereumAdressOfMyNFT', chain_ids: ['1'] },
            { address: 'EthereumAdressOfMyNFT', chain_ids: ['1'], token_ids: ['NumberString'] },
            { address: 'EthereumAdressOfMyToken', chain_ids: ['1'], balance_threshold: ['1000000000000000000'] },
        ],
        isArray: true,
    })
        validation_constraints: (BalanceOf | OwnerOf)[];
    
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsHash('md5', { each:true })
    @ApiProperty({
        description: 'Token startegies allowed to be used in polls',
        required: false,
        isArray: true,
    })
        token_strategy_allowlist: string[];
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
                { value: CommunityClientConfigEthereumDto, name: 'ethereum' },
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
                user_denylist: ['NumberString'],
            },
            {
                provider_id: 'ethereum',
                address: 'NumberString',
                address_allowlist: ['NumberString'],
                address_denylist: ['NumberString'],
                token_strategy_allowlist: ['NumberString'],
                token_strategy_denylist: ['NumberString'],
                validation_constraints: [{ address: 'EthereumAdressOfMyNFT', chain_ids: ['1'] }],
            },
        ],
        isArray: true,
    })
        client_config: (CommunityClientConfigDiscordDto | CommunityClientConfigEthereumDto)[];

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
