import { Type } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Token } from '../../web3.dtos';

export class TokenMeta {

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Token Symbol',
        required: false,
        example: 'BANK',
    })
        symbol: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Token Name',
        required: false,
        example: 'Bankless Token',
    })
        name: string;
}

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

    @IsObject()
    @IsOptional()
    @ApiProperty({
        description: 'Token Metadata',
        required: false,
    })
    @Type(() => TokenMeta)
        meta: TokenMeta;

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