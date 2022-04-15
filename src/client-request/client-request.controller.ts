import {Body, Controller, Post, MessageEvent, HttpException, HttpStatus, Param, Get} from '@nestjs/common';
import {ApiCreatedResponse, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';
import {DiscordRequestDto, DiscordResponsetDto} from './client-request.dtos';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Request data from client')
@Controller()
export class ClientRequestController {
    constructor(
        protected sseService: SseService,
    ) {
        // do nothing
    }

    @Get('client/discord/channels/:guild_id')
    @ApiOperation({ description: 'Request data from client' })
    @ApiCreatedResponse({ description: `Emits the ${constants.EVENT_REQUEST_CLIENT_DATA} event with specified payload`, type: DiscordRequestDto })
    @ApiParam({ name: 'guild_id', description: 'discord guild ID' })
    async sendRequest(@Param('guild_id') guild_id): Promise<MessageEvent> {
        const data = new DiscordRequestDto;
        data.provider_id = 'discord';
        data.method = 'channels';
        data.uuid = uuidv4();
        data.guildId = guild_id;

        const event = {
            data: data,
            type: constants.EVENT_REQUEST_CLIENT_DATA,
        };
        await this.sseService.emit(event as MessageEvent);
        return event;
    }

    @Post('client/discord/channels')
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