import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { ApiKeyAuthService } from './api-key.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
    constructor(
        private readonly apiKeyAuthService: ApiKeyAuthService,
    ) {
        super({ header: 'X-API-KEY', prefix: '' },
            true,
            async (apiKey: string, done: (error: Error, data: boolean) => Record<string, unknown>) => {
                return this.validate(apiKey, done);
            },
        );
    }

    public validate = (apiKey: string, done: (error: Error, data: boolean) => Record<string, unknown>) => {
        this.apiKeyAuthService.validateApiKey(apiKey).then((keyValid) => {
            if(keyValid) {
                done(null, true);
            }
            done(new UnauthorizedException(), null);
        });
    };
}

@Injectable()
export class ApiKeyStrategyAdmin extends PassportStrategy(Strategy, 'api-key-admin') {
    constructor(
        private readonly apiKeyAuthService: ApiKeyAuthService,
    ) {
        super({ header: 'X-API-KEY', prefix: '' },
            true,
            async (apiKey: string, done: (error: Error, data: boolean) => Record<string, unknown>) => {
                return this.validate(apiKey, done);
            },
        );
    }

    public validate = (apiKey: string, done: (error: Error, data: boolean) => Record<string, unknown>) => {
        if (this.apiKeyAuthService.validateApiAdminKey(apiKey)) {
            done(null, true);
        }

        done(new UnauthorizedException(), null);
    };
}