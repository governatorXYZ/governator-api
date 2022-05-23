import { IsMongoId } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class UserResponseDto {

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user id - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @ApiProperty({
        description: 'Datetime when record was created',
        required: false,
    })
        createdAt: string;

    @ApiProperty({
        description: 'Datetime when record was last updated',
        required: false,
    })
        updatedAt: string;

}

export class UserCreateDto extends OmitType(UserResponseDto, ['_id', 'createdAt', 'updatedAt'] as const) {}

export class UserUpdateDto extends PartialType(UserCreateDto) {}