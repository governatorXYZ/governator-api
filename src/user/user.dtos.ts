import { IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { AccountBase, DiscordAccountResponseDto, EthereumAccountResponseDto } from '../account/account.dtos';
import { Type } from 'class-transformer';

export class UserResponseDto {

    @IsMongoId()
    @ApiProperty({
        description: 'Governator user id - (auto generated if left blank)',
        required: false,
        default: new ObjectId(),
    })
        _id: string;

    @IsArray()
    @Type(() => AccountBase, {
        // keepDiscriminatorProperty: true,
        discriminator: {
            property: '__type',
            subTypes: [
                { value: EthereumAccountResponseDto, name: 'EthereumAccountResponseDto' },
                { value: DiscordAccountResponseDto, name: 'DiscordAccountResponseDto' },
            ],
        },
    })
    @ApiProperty({
        description: 'Datetime when record was created',
        required: false,
    })
        provider_accounts: AccountBase[];

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

export class UserCreateDto extends OmitType(UserResponseDto, ['_id', 'createdAt', 'updatedAt', 'provider_accounts'] as const) {}

export class UserUpdateDto extends PartialType(UserCreateDto) {}