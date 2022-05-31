import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EthereumAccountResponseDto } from '../account/account.dtos';
import { IsEthAddress } from '../common/isEthAddress.decorator';

export class EthereumAccountVerifyDto extends PickType(EthereumAccountResponseDto, ['_id', 'signed_message', 'verification_message'] as const) {}

export class TokenList {

    @IsArray()
    @IsEthAddress()
    @ValidateNested({ each: true })
    @Type(() => Token)
    @ApiProperty({
        description: 'Array of ERC20 tokens to query for balance',
        required: true,
        isArray: true,
        example: [{ contractAddresses: '0x123..', chain_id: 1 }, { contractAddresses: '0x345..', chain_id: 134 }],
    })
        tokens: Token[];
}

export class Token {

    @IsEthAddress()
    @ValidateNested({ each: true })
    @ApiProperty({
        description: 'ERC20 token contract address',
        required: true,
        example: '0x123..',
    })
        contractAddresses: string;

    @IsNumber()
    @ApiProperty({
        description: 'Chain Id',
        required: true,
        example: 1,
    })
        chain_id: number;
}

export class ERC20TokenBalanceDetail {

    @IsEthAddress()
    @ApiProperty({
        description: 'ERC20 token contract address',
        required: true,
        example: '0x123..',
    })
        contractAddress: string;

    @IsNumber()
    @ApiProperty({
        description: 'Chain Id',
        required: true,
        example: 1,
    })
        chain_id: number;

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
