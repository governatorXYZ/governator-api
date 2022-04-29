import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsUUID } from 'class-validator';
import constants from '../common/constants';

export const getDataProviderMethods = () => {
    const methods = [];
    Array.from(constants.PROVIDERS.values()).forEach((value) => {
        value.methods.forEach(datasource => methods.push(datasource));
    });
    return methods;
};

export class DiscordRequestDto {
    @ApiProperty({
        description: 'Unique Id of this request',
        required: true,
    })
        uuid: string;

    @ApiProperty({
        description: 'Id of data provider (e.g. discord)',
        required: true,
    })
        provider_id: string;

    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        method: string;

    @ApiProperty({
        description: 'Datasource Id',
        required: true,
    })
        guildId: string;
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

    @ApiProperty({
        description: 'Requested data',
        required: true,
        isArray: true,
    })
        data: string[];
}

