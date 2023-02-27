import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';

@Injectable()
export class ApiKeyAuthGuard extends PassportAuthGaurd('api-key') {
    constructor(protected readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.get<boolean>(
            'isPublic',
            context.getHandler(),
        );

        if (isPublic) {
            return true;
        }

        return await super.canActivate(context) as boolean;
    }
}

@Injectable()
export class ApiKeyAdminAuthGuard extends PassportAuthGaurd('api-key-admin') {
    constructor() {
        super();
    }

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
}