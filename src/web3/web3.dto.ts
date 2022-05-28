import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EthereumAccountResponseDto } from '../account/account.dtos';

export class EthereumAccountVerifyDto extends PartialType(PickType(EthereumAccountResponseDto, ['user_id', '_id', 'signed_message'] as const)) {}


// export class EthAddressVerificationDto {
//
//     @IsMongoId()
//     @ApiProperty({
//         description: 'Governator user ID',
//         required: true,
//     })
//         user_id: string;
//
//     @IsEthAddress()
//     @ApiProperty({
//         description: 'Ethereum address of signer account',
//         required: true,
//         example: '0x123..',
//     })
//         address: string;
//
//     @ApiProperty({
//         description: 'Signature of signer account',
//         required: true,
//     })
//         signature: string;
//
//     @ApiProperty({
//         description: 'Message that has been signed',
//         required: true,
//     })
//         verification_message: string;
// }

export class TokenList {

    @IsArray()
    @IsString({
        each: true,
    })
    @ApiProperty({
        description: 'Array of ERC20 token contract addresses to query for balance',
        required: true,
        example: ['0x123..', '0x234..'],
    })
        contractAddresses: string[];
}

export class ERC20TokenBalanceDetail {

    @ApiProperty({
        description: 'ERC20 token contract address',
        required: true,
        example: '0x123..',
    })
        contractAddress: string;

    @ApiProperty({
        description: 'ERC20 token name',
        required: true,
        example: 'Governator Token',
    })
        tokenName: string;

    @ApiProperty({
        description: 'ERC20 token symbol',
        required: true,
        example: 'GOV',
    })
        tokenSymbol: string;

    @IsNumber()
    @ApiProperty({
        description: 'ERC20 token balance',
        required: true,
        example: 20.3,
    })
        balance: number;
}

export class ERC20TokenBalances {

    @ApiProperty({
        description: 'Ethereum account address',
        required: true,
        example: '0x123..',
    })
        account: string;

    @IsArray()
    @Type(() => ERC20TokenBalanceDetail)
    @ApiProperty({
        description: 'Array of ERC20 token balances',
        required: true,
        type: ERC20TokenBalanceDetail,
        isArray: true,
        example: [{ contractAddress: '0x123..', tokenName: 'Governator Token', tokenSymbol: 'GOV', balance: 20.3 }],
    })
        tokenBalances: ERC20TokenBalanceDetail[];
}
