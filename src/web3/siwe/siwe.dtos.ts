import { IsEthAddress } from '../../common/isEthAddress.decorator';
import { Transform, Type } from 'class-transformer';
import { ethers } from 'ethers';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import constants from '../../common/constants';

export class LinkAccountDto {

    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'Provider ID - ',
        required: true,
        example: 'discord',
    })
        provider_id: string;

    @IsString()
    @ApiProperty({
        description: 'Signed message',
        required: true,
        example: '1234567890099823',
    })
        _id: string;
}

export class SiweVerifyDto {

    @IsEthAddress()
    @Transform(({ value: value }) => {
        try {
            return ethers.getAddress(value);

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

    @IsString()
    @ApiProperty({
        description: 'Verification message',
        required: true,
        example: 'Verification message',
    })
        verification_message: string;

    @IsString()
    @ApiProperty({
        description: 'Signed message',
        required: true,
        example: '0x123..',
    })
        signed_message: string;

    @Type(() => LinkAccountDto)
    @IsOptional()
    @ApiProperty({
        description: 'Account to be linked',
        required: false,
    })
        link_account: LinkAccountDto;
}