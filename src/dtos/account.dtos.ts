import { IsDate, IsMongoId } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Transform } from 'class-transformer';

export class CreateAccountDto {

    @IsMongoId()
    @ApiProperty({
        description: 'Governator account id - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user ID',
        required: true,
    })
        user_id: string;

    @ApiProperty({
        description: 'Type of auth provider - e.g. oauth',
        required: true,
    })
        provider_type: string;

    @ApiProperty({
        description: 'ID of auth provider e.g. discord',
        required: true,
    })
        provider_id: string;

    @ApiProperty({
        description: 'User Id for provider',
        required: true,
    })
        provider_account_id: string;

    @ApiProperty({
        description: 'Provider refresh token',
        required: false,
    })
        refresh_token: string;

    @ApiProperty({
        description: 'Provider access token',
        required: false,
    })
        access_token: string;

    @IsDate()
    @Transform(({ value }) => new Date(value), { toClassOnly: true })
    @ApiProperty({
        description: 'User Id for provider',
        required: false,
    })
        access_token_expires: Date;

}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}