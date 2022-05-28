import { IsMongoId, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { IsEthAddress } from '../common/isEthAddress.decorator';

export abstract class AccountBase {
    @IsMongoId()
    @ApiProperty({
        description: 'mongodb account id',
        required: false,
        default: new ObjectId(),
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

    @ApiProperty({
        description: 'discord',
        required: true,
        default: 'discord',
        example: 'discord',
    })
        provider_id: string;

    // @IsNumberString()
    // @ApiProperty({
    //     description: 'Discord user Id',
    //     required: true,
    //     example: '123456789873827394',
    // })
    //     provider_account_id: string;

    @ApiProperty({
        description: 'Discord username',
        required: true,
        example: 'governator',
    })
        discord_username: string;

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

export class DiscordAccountCreateDto extends OmitType(DiscordAccountResponseDto, ['user_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

export class DiscordAccountUpdateDto extends OmitType(PartialType(DiscordAccountResponseDto), ['_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

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

    @ApiProperty({
        description: 'ethereum',
        required: true,
        example: 'ethereum',
        default: 'ethereum',
    })
        provider_id: string;

    // @IsOptional()
    // @IsEthAddress()
    // @ApiProperty({
    //     description: 'Ethereum account address',
    //     required: false,
    //     example: '0x123...',
    // })
    //     provider_account_id: string;

    // @IsOptional()
    // @ApiProperty({
    //     description: 'Ethereum network ID',
    //     required: false,
    //     default: 1,
    // })
    // network_id: number;

    // @ApiProperty({
    //     description: 'Chain ID - 1 = Mainnet : Ethereum main network, 3 = Ropsten: Ethereum test network (PoW), 4 = Rinkeby : Ethereum test network (PoA), 42 = Kovan : Ethereum test network (PoA), 1284 = Moonbeam, 1287 = Moonbase Alpha',
    //     required: true,
    //     default: 1,
    // })
    //     chain_id: number;

    // @ApiProperty({
    //     description: 'Ethereum network name',
    //     required: true,
    //     default: 'Mainnet',
    // })
    //     network_name: string;

    @IsOptional()
    @ApiProperty({
        description: 'Message to be signed',
        required: false,
        default: '',
        example: 'verification message',
    })
        verification_message: string;

    @IsOptional()
    @ApiProperty({
        description: 'Signed message',
        required: false,
        default: '',
    })
        signed_message: string;

    @ApiProperty({
        description: 'Whether signature has been verified',
        required: true,
        default: false,
    })
        verified: boolean;

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

export class EthereumAccountCreateDto extends OmitType(EthereumAccountResponseDto, ['user_id', 'createdAt', 'updatedAt', 'provider_id', 'verification_message', 'verified', 'signed_message'] as const) {}

export class EthereumAccountUpdateDto extends OmitType(PartialType(EthereumAccountResponseDto), ['_id', 'createdAt', 'updatedAt', 'provider_id'] as const) {}

// TODO remove
// export abstract class AccountBase {
//     @IsMongoId()
//     @ApiProperty({
//         description: 'mongodb ethereum account id - (auto generated)',
//         required: false,
//         default: new ObjectId(),
//     })
//         _id: string;
//
//     @IsMongoId()
//     @ApiProperty({
//         description: 'Governator user ID',
//         required: true,
//         example: new ObjectId(),
//     })
//         user_id: string;
//
//     @ApiProperty({
//         description: 'Datetime when record was created',
//         required: false,
//         example: new Date(Date.now()),
//     })
//         createdAt: string;
//
//     @ApiProperty({
//         description: 'Datetime when record was last updated',
//         required: false,
//         example: new Date(Date.now()),
//     })
//         updatedAt: string;
// }

// export class AccountResponseDto {
//
//     @IsMongoId()
//     @ApiProperty({
//         description: 'Governator account id - (auto generated if left blank)',
//         required: false,
//         default: new ObjectId(),
//     })
//         _id: string;
//
//     @IsMongoId()
//     @ApiProperty({
//         description: 'Governator user ID',
//         required: true,
//     })
//         user_id: string;
//
//     @IsIn(Array.from(constants.PROVIDERS.keys()))
//     @ApiProperty({
//         description: 'ID of auth provider e.g. discord',
//         required: true,
//         enum: Array.from(constants.PROVIDERS.keys()),
//     })
//         provider_id: string;
//
//     @IsOptional()
//     @ApiProperty({
//         enum: [EthereumAccount, DiscordAccount],
//         description: 'Provider account object',
//         required: false,
//         example: 'EthereumAccount {network: "mainnnet", provider_account_id: "0x123.."} | DiscordAccount {provider_account_id: "12345..", discord_username: "governator"}',
//     })
//         provider_account: EthereumAccount | DiscordAccount;
//
//     @ApiProperty({
//         description: 'Datetime when record was created',
//         required: false,
//     })
//         createdAt: string;
//
//     @ApiProperty({
//         description: 'Datetime when record was last updated',
//         required: false,
//     })
//         updatedAt: string;
// }
//
// export class AccountCreateDto extends OmitType(AccountResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {}
//
// export class AccountUpdateDto extends PartialType(AccountCreateDto) {}
