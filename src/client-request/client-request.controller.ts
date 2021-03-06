import {
    Body,
    Controller,
    Post,
    MessageEvent,
    HttpException,
    HttpStatus,
    Param,
    Get,
    Logger,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SseService } from '../sse/sse.service';
import constants from '../common/constants';
import { DiscordRequestDto, DiscordResponsetDto } from './client-request.dtos';
import { v4 as uuidv4 } from 'uuid';
import { ClientRequestService } from './client-request.service';
import { firstValueFrom, throwError, timeout } from 'rxjs';

@ApiTags('Request data from client')
@ApiSecurity('api_key')
@Controller()
export class ClientRequestController {
    private readonly logger = new Logger(ClientRequestController.name);
    constructor(
        protected sseService: SseService,
        protected clientRequestService: ClientRequestService,
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
        const observable = this.clientRequestService.eventStream.asObservable().pipe(
            timeout({
                each: 3000,
                with: () => throwError(() => new HttpException('Client response timed out, check if bot is running', HttpStatus.SERVICE_UNAVAILABLE)),
            }),
        );
        this.sseService.emit(event as MessageEvent);
        this.logger.debug('awaiting client response');
        return await firstValueFrom(observable);
    }

    @Post('client/discord/data-response')
    @ApiOperation({ description: 'Client can submit requested data to this endpoint' })
    @ApiCreatedResponse({ description: 'Forwards client response to the get request observable' })
    async sendResponse(@Body() params: DiscordResponsetDto): Promise<void> {
        await this.clientRequestService.emit(params);
    }

}