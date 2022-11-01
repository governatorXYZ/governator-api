import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class StrategyRequestDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'address to get voting power of',
        required: false,
    })
        account_id: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'user to get voting power of',
        required: false,
    })
        block_height: number | null;
}

export class StrategyResponseDto {

    @IsString()
    @ApiProperty({
        description: 'Strategy ID - (auto generated - hash of file name)',
        required: false,
    })
        _id: string;

    @MaxLength(256)
    @ApiProperty({
        description: 'Strategy name',
        required: true,
    })
        name: string;

    @IsUrl()
    @ApiProperty({
        description: 'endpoint',
        required: true,
    })
        endpoint: string;

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

export class StrategyCreateDto extends OmitType(StrategyResponseDto, ['createdAt', 'updatedAt'] as const) {}
