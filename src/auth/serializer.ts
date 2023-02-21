import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthProvider } from './auth';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authService: AuthProvider,
    ) {
        super();
    }

    serializeUser(user: any, done: (err: Error, usr: any) => void) {
        console.log(user);
        done(null, user);
    }

    async deserializeUser(payload: any, done: (err: Error, user: any) => void) {

        const user = this.authService.findUser();
        console.log(user)
        done(null, user);
    }
}