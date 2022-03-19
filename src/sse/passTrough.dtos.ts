import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DummyDataDto {
    @IsOptional()
    @ApiProperty({
        description: 'Send some test data to the sse stream',
        required: false,
    })
        data: Record<string, any>;
}