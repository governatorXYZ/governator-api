import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { DiscordAccountResponseDto, DiscordAccountUpdateDto } from '../../account/account.dtos';
import { DiscordAccountMongoService } from '../../account/discordAccount.mongo.service';

interface DiscordUser {
    username: string,
    discriminator: string,
    account_id: string,
    avatar: string,
    provider_id: string,
    accessToken: string,
    refreshToken: string,
}

@Injectable()
export class DiscordAuthService {

    constructor(
        private readonly discordAccountService: DiscordAccountMongoService,
        private readonly userService: UserService,
    ) {
        // do nothing
    }
    async validateUser(discordUser: DiscordUser) {

        let existingAccount = await this.findDiscordAccount(discordUser.account_id);

        if (!existingAccount) {
            existingAccount = await this.createAccount(discordUser);

        } else if (
            existingAccount.avatar !== discordUser.avatar ||
            existingAccount.accessToken !== discordUser.accessToken ||
            existingAccount.discord_username !== discordUser.username ||
            existingAccount.refreshToken !== discordUser.refreshToken
        ) {
            existingAccount = await this.updateAccount(discordUser);
        }

        const safeAccount = { ...existingAccount };
        delete safeAccount.accessToken;
        delete safeAccount.refreshToken;
        safeAccount.avatar = `https://cdn.discordapp.com/avatars/${(safeAccount as DiscordAccountResponseDto)._id}/${safeAccount.avatar}`;

        return safeAccount;

    }

    async createAccount(discordUser: DiscordUser) {
        return this.discordAccountService.createAccount(
            {
                _id: discordUser.account_id,
                discord_username: discordUser.username,
                discriminator: discordUser.discriminator,
                accessToken: discordUser.accessToken,
                refreshToken: discordUser.refreshToken,
                avatar: discordUser.avatar,
            },
        );
    }

    async updateAccount(discordUser: DiscordUser) {
        return this.discordAccountService.findOneAndUpdateAccount(
            { _id: discordUser.account_id },
            {
                avatar: discordUser.avatar,
                accessToken: discordUser.accessToken,
                discord_username: discordUser.username,
                refreshToken: discordUser.refreshToken,
            },
        );
    }

    async findDiscordAccount(discordId: string) {
        return this.discordAccountService.findOneAccount({ _id: discordId }) as DiscordAccountUpdateDto;
    }

    async getUser(governatorId: string) {
        return this.userService.fetchUserById(governatorId);
    }
    
}
