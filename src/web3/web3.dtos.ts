import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthAddress } from '../common/isEthAddress.decorator';
import { ethers } from 'ethers';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IsNumber } from 'class-validator';

export class EthAddress {

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
        _id: string;
}

export class Token {

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
}
