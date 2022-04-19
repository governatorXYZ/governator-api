import { Body, Controller, Post, MessageEvent, HttpException, HttpStatus, Param, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';
import { DiscordRequestDto, DiscordResponsetDto } from './client-request.dtos';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Request data from client')
@Controller()
export class ClientRequestController {
    constructor(
        protected sseService: SseService,
    ) {
        // do nothing
    }

    @Get('client/discord/:guild_id/:datasource')
    @ApiOperation({ description: 'Request data from client' })
    @ApiCreatedResponse({ description: `Emits the ${constants.EVENT_REQUEST_CLIENT_DATA} event with specified payload`, type: DiscordRequestDto })
    @ApiParam({
        description: 'discord guild (=server) ID',
        type: String,
        name:'guild_id',
    })
    @ApiParam({
        description: 'data set you want to request',
        type: String,
        name:'datasource',
        enum: constants.PROVIDERS.get('discord').methods,
    })
    async sendRequest(@Param('guild_id') guild_id, @Param('datasource') datasource): Promise<MessageEvent> {

        if (!constants.PROVIDERS.get('discord').methods.includes(datasource)) {
            throw new HttpException(`Invalid datasource, should be one of ${constants.PROVIDERS.get('discord').methods}`, HttpStatus.BAD_REQUEST);
        }

        const data = new DiscordRequestDto;
        data.provider_id = 'discord';
        data.method = datasource;
        data.uuid = uuidv4();
        data.guildId = guild_id;

        const event = {
            data: data,
            type: constants.EVENT_REQUEST_CLIENT_DATA,
        };
        await this.sseService.emit(event as MessageEvent);
        return event;
    }

    @Post('client/discord/data-response')
    @ApiOperation({ description: 'Client can submit requested data to this endpoint' })
    @ApiCreatedResponse({ description: `Emits the specified ${constants.EVENT_RESPONSE_CLIENT_DATA} event with specified payload`, type: DiscordResponsetDto })
    async sendResponse(@Body() params: DiscordResponsetDto): Promise<MessageEvent> {
        const event = {
            data: params,
            type: constants.EVENT_RESPONSE_CLIENT_DATA,
        };
        await this.sseService.emit(event as MessageEvent);
        return event;
    }

}