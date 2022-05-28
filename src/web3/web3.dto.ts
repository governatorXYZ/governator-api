import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EthereumAccountResponseDto } from '../account/account.dtos';
import {IsEthAddress} from "../common/isEthAddress.decorator";

export class EthereumAccountVerifyDto extends PartialType(PickType(EthereumAccountResponseDto, ['_id', 'signed_message'] as const)) {}

export class TokenList {

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({
        description: 'Array of ERC20 token contract addresses to query for balance',
        required: true,
        example: ['0x123..', '0x234..'],
    })
        contractAddresses: string[];
}

export class ERC20TokenBalanceDetail {

    @IsEthAddress()
    @ApiProperty({
        description: 'ERC20 token contract address',
        required: true,
        example: '0x123..',
    })
        contractAddress: string;

    @IsString()
    @ApiProperty({
        description: 'ERC20 token name',
        required: true,
        example: 'Governator Token',
    })
        tokenName: string;

    @IsString()
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

    @IsEthAddress()
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
