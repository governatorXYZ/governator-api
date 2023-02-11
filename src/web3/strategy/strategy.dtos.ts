import { IsNotEmpty, IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class BlockHeight {
    @IsNotEmpty()
    @ApiProperty({
        description: 'chain Id',
        required: false,
    })
        chain_id: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'block',
        required: false,
    })
        block: number;
}

export class StrategyRequestDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'address to get voting power of',
        required: false,
    })
        account_id: string;

    @IsOptional()
    @IsArray()
    @ApiProperty({
        description: 'user to get voting power of',
        required: false,
        isArray: true,
        type: BlockHeight,
    })
        block_height: BlockHeight[];
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
        description: 'Endpoint',
        required: true,
    })
        endpoint: string;

    @IsString()
    @ApiProperty({
        description: 'Type of strategy',
        required: true,
    })
        strategy_type: string;

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
