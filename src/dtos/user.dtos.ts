import { IsBoolean, IsEmail, IsMongoId } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateUserDto {

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user id - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @ApiProperty({
        description: 'Governator username',
        required: true,
    })
        name: string;

    @ApiProperty({
        description: 'Governator pfp',
        required: false,
    })
        image: string;

    @IsEmail()
    @ApiProperty({
        description: 'user email',
        required: false,
    })
        email: string;

    @IsBoolean()
    @ApiProperty({
        description: 'whether email is verified',
        required: false,
    })
        email_verified: boolean;

}

export class UpdateUserDto extends PartialType(CreateUserDto) {}