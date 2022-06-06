import { ArrayMaxSize, IsArray, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEthAddress } from '../../common/isEthAddress.decorator';
import { ethers } from 'ethers';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Token } from '../web3.dtos';

export class TokenList {

    @IsArray()
    @Type(() => Token)
    @ApiProperty({
        description: 'Array of ERC20 tokens to query for balance',
        required: true,
        isArray: true,
        example: [{ contractAddresses: '0x123..', chain_id: 1 }, { contractAddresses: '0x345..', chain_id: 134 }],
    })
        tokens: Token[];
}

export class ERC721OwnerOfDto {

    @IsEthAddress()
    @Transform(({ value: value }) => {
        try {
            return ethers.utils.getAddress(value);

        } catch (e) {
            const error = e as Error;

            throw new HttpException(error.message, HttpStatus.EXPECTATION_FAILED);
        }
    })
    @ApiProperty({
        description: 'ERC721 token contract address',
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

    @IsArray()
    @ArrayMaxSize(100)
    // FIXME
    // @ValidateNested({ each: true })
    @ApiProperty({
        description: 'Array of ERC721 token IDs to query for ownership',
        required: true,
        isArray: true,
        example: [983093284324, 983409384032],
    })
        tokens: Array<number>;
}

export class ERC1155BalanceOfDto extends OmitType(ERC721OwnerOfDto, ['tokens'] as const) {

    @IsNumber()
    @ApiProperty({
        description: 'Array of ERC721 token IDs to query for ownership',
        required: true,
        example: 983093284324,
    })
        token_id: number;
}

export class ERC20TokenBalanceDetail {

    @IsEthAddress()
    @Transform(({ value: value }) => {
        try {
            return ethers.utils.getAddress(value);

        } catch (e) {
            const error = e as Error;

            throw new HttpException(error.message, HttpStatus.EXPECTATION_FAILED);
        }
    })
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
    @Transform(({ value: value }) => {
        try {
            return ethers.utils.getAddress(value);

        } catch (e) {
            const error = e as Error;

            throw new HttpException(error.message, HttpStatus.EXPECTATION_FAILED);
        }
    })
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