import { ApiProperty } from '@nestjs/swagger';
import {IsArray, IsIn, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsUUID} from 'class-validator';
import constants from '../common/constants';
import {Type} from "class-transformer";
import {ClientConfigBase} from "../poll/poll.dtos";

export const getDataProviderMethods = () => {
    const methods = [];
    Array.from(constants.PROVIDERS.values()).forEach((value) => {
        value.methods.forEach(datasource => methods.push(datasource));
    });
    return methods;
};

export class DiscordRequestDto {
    @IsUUID()
    @ApiProperty({
        description: 'Unique Id of this request',
        required: true,
    })
        uuid: string;

    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'Id of data provider (e.g. discord)',
        required: true,
    })
        provider_id: string;

    @IsIn(getDataProviderMethods())
    @ApiProperty({
        description: 'Datasource Id - e.g. channels or roles',
        required: true,
    })
        method: string;

    @IsNumberString()
    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        guildId: string;

    @IsNumberString()
    @IsOptional()
    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        userId: string;
}

class ClientResponseDataDto {
    @IsNotEmpty()
    @ApiProperty({
        description: 'name of channel or role indexed by ID (snowflake)',
    })
        snowflake: string;
}

export class DiscordResponsetDto {
    @IsUUID()
    @ApiProperty({
        description: 'Unique Id of this request (as received from request)',
        required: true,
    })
        uuid: string;

    @IsIn(Array.from(constants.PROVIDERS.keys()))
    @ApiProperty({
        description: 'Id of data provider (e.g. discord)',
        required: true,
    })
        provider_id: string;

    @IsIn(getDataProviderMethods())
    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        method: string;

    @IsNumberString()
    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        guildId: string;

    @IsArray()
    @Type(() => ClientResponseDataDto)
    @ApiProperty({
        description: 'Requested data',
        required: true,
        isArray: true,
        type: ClientResponseDataDto,
    })
        data: ClientResponseDataDto[];
}

