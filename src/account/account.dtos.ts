import { IsIn, IsMongoId, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import constants from '../common/constants';
import { IsEthAddress } from '../common/isEthAddress.decorator';

export class DiscordAccount {

    @IsNumberString()
    @ApiProperty({
        description: 'Discord user Id',
        required: true,
    })
        provider_account_id: string;

    @ApiProperty({
        description: 'Discord username',
        required: true,
    })
        discord_username: string;
}

export class EthereumAccount {

    @ApiProperty({
        description: 'Ethereum network',
        required: true,
        default: 'mainnet',
    })
        network: string;

    @IsEthAddress()
    @ApiProperty({
        description: 'Ethereum account address',
        required: true,
    })
        provider_account_id: string;

    @IsOptional()
    @ApiProperty({
        description: 'Message to be signed',
        required: false,
    })
        verification_message: string;

    @IsOptional()
    @ApiProperty({
        description: 'Signed message',
        required: false,
    })
        signed_message: string;

    @ApiProperty({
        description: 'Whether signature has been verified',
        required: true,
        default: false,
    })
        verified: boolean;
}

export class AccountResponseDto {

    @IsMongoId()
    @ApiProperty({
        description: 'Governator account id - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
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
        description: 'ID of auth provider e.g. discord',
        required: true,
        enum: Array.from(constants.PROVIDERS.keys()),
    })
        provider_id: string;

    @IsOptional()
    @ApiProperty({
        enum: [EthereumAccount, DiscordAccount],
        description: 'Provider account object',
        required: false,
        example: 'EthereumAccount {network: "mainnnet", provider_account_id: "0x123.."} | DiscordAccount {provider_account_id: "12345..", discord_username: "governator"}',
    })
        provider_account: EthereumAccount | DiscordAccount;

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

export class AccountCreateDto extends OmitType(AccountResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {}

export class AccountUpdateDto extends PartialType(AccountCreateDto) {}
