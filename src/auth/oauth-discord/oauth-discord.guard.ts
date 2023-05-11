import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';

@Injectable()
export class DiscordAuthGuard extends PassportAuthGaurd('discord') {
    constructor() {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const activate = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return activate;
    }
}

@Injectable()
export class IsAuthenticatedGuard extends ApiKeyAuthGuard implements CanActivate {
    constructor(protected readonly reflector: Reflector) {
        super(reflector);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if (request.isAuthenticated()) {
            return true;
        }

        return await super.canActivate(context) as boolean;
    }
}