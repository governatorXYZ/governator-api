import { IsIn, IsMongoId, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { IsEthAddress } from '../common/isEthAddress.decorator';
import constants from '../common/constants';

export abstract class AccountBase {
    @IsMongoId()
    @ApiProperty({
        description: 'mongodb account id',
        required: false,
    })
        _id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID',
        required: true,
        example: new ObjectId(),
    })
        user_id: string;

    @ApiProperty({
        description: 'Datetime when record was created',
        required: false,
        example: new Date(Date.now()),
    })
        createdAt: string;

    @ApiProperty({
        description: 'Datetime when record was last updated',
        required: false,
        example: new Date(Date.now()),
    })
        updatedAt: string;
}

export class DiscordAccountResponseDto extends AccountBase {

    @IsNumberString()
    @ApiProperty({
        description: 'Discord user Id',
        required: true,
        example: '123456789873827394',
    })
        _id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID',
        required: true,
    })
        user_id: string;

    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'discord',
        required: true,
        default: 'discord',
        example: 'discord',
    })
        provider_id: string;

    @IsString()
    @ApiProperty({
        description: 'Discord username',
        required: true,
        example: 'governator',
    })
        discord_username: string;

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

export class DiscordAccountCreateDto extends OmitType(DiscordAccountResponseDto, ['user_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

export class DiscordAccountUpdateDto extends OmitType(PartialType(DiscordAccountResponseDto), ['_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

export class DiscordAccountValidateUserIdDto extends PickType(DiscordAccountResponseDto, ['user_id'] as const) {}

export class DiscordAccountValidateAccountIdDto extends PickType(DiscordAccountResponseDto, ['_id'] as const) {}

export class EthereumAccountResponseDto extends AccountBase {

    @IsEthAddress()
    @ApiProperty({
        description: 'Ethereum address',
        required: true,
        example: '0x123..',
    })
        _id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID',
        required: true,
    })
        user_id: string;

    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'ethereum',
        required: true,
        example: 'ethereum',
        default: 'ethereum',
    })
        provider_id: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Message to be signed',
        required: false,
        default: '',
        example: 'verification message',
    })
        verification_message: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Signed message',
        required: false,
        default: '',
    })
        signed_message: string;

    @IsString()
    @ApiProperty({
        description: 'Whether signature has been verified',
        required: true,
        default: false,
    })
        verified: boolean;

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

export class EthereumAccountCreateDto extends OmitType(EthereumAccountResponseDto, ['user_id', 'createdAt', 'updatedAt', 'provider_id', 'verification_message', 'verified', 'signed_message'] as const) {}

export class EthereumAccountUpdateDto extends OmitType(PartialType(EthereumAccountResponseDto), ['_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

export class EthereumAccountUpdateUserDto extends PickType(EthereumAccountUpdateDto, ['user_id'] as const) {}

