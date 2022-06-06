import { Type } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsObject, IsString } from 'class-validator';
import { Token } from '../../web3.dtos';

export class TokenWhitelistResponseDto {

    @IsObject()
    @Type(() => Token)
    @ApiProperty({
        description: 'Token',
        required: true,
        example: { contractAddress: '0x123..', chain_id: 1 },
    })
        _id: Token;

    @IsNumber()
    @IsIn([20, 721, 1155])
    @ApiProperty({
        description: 'Type of contract (ERC)',
        required: true,
        example: 20,
    })
        erc: number;

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

export class TokenWhitelistCreateDto extends PickType(TokenWhitelistResponseDto, ['_id', 'erc'] as const) {}