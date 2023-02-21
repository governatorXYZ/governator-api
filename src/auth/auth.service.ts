import { Injectable } from "@nestjs/common";
import { AuthProvider, UserData } from "./auth";

@Injectable()
export class AuthService implements AuthProvider {
    async validateUser(details: UserData) {
        return {
            username: 'Tiki',
            discriminator: '123',
            discordId: '123',
            avatar: 'url',
        };
    }
    createUser() {
        throw new Error("Method not implemented.");
    }
    findUser() {
        return {
            username: 'Tiki',
            discriminator: '123',
            discordId: '123',
            avatar: 'url',
        };
    }
    
}
