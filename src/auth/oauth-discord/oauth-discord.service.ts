import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { DiscordAccountResponseDto, DiscordAccountUpdateDto } from '../../account/account.dtos';
import { DiscordAccountMongoService } from '../../account/discordAccount.mongo.service';
import { OauthSession, DiscordUser } from '../auth.dtos';
import axios from 'axios';

@Injectable()
export class DiscordAuthService {

    constructor(
        private readonly discordAccountService: DiscordAccountMongoService,
        private readonly userService: UserService,
    ) {
        // do nothing
    }
    async validateUser(discordUser: DiscordUser) {

        let existingAccount = await this.findDiscordAccount(discordUser._id);

        if (!existingAccount) {
            existingAccount = await this.createAccount(discordUser);

        } else if (
            existingAccount.avatar !== discordUser.avatar ||
            existingAccount.accessToken !== discordUser.accessToken ||
            existingAccount.discord_username !== discordUser.discord_username ||
            existingAccount.refreshToken !== discordUser.refreshToken ||
            existingAccount.discriminator !== discordUser.discriminator
        ) {
            existingAccount = await this.updateAccount(discordUser);
        }

        const { discord_username, discriminator, _id, avatar, provider_id, user_id: governatorId } = existingAccount as DiscordAccountResponseDto;

        const sessionAccount: OauthSession = {
            governatorId,
            status: 200,
            oauthProfile: {
                discord_username,
                discriminator,
                _id,
                avatar: `https://cdn.discordapp.com/avatars/${_id}/${avatar}`,
                provider_id,
            },
        };

        return sessionAccount;

    }

    async createAccount(discordUser: DiscordUser) {
        return this.discordAccountService.createAccount(
            {
                _id: discordUser._id,
                discord_username: discordUser.discord_username,
                discriminator: discordUser.discriminator,
                accessToken: discordUser.accessToken,
                refreshToken: discordUser.refreshToken,
                avatar: discordUser.avatar,
            },
        );
    }

    async updateAccount(discordUser: DiscordUser) {
        return this.discordAccountService.findOneAndUpdateAccount(
            { _id: discordUser._id },
            {
                avatar: discordUser.avatar,
                discriminator: discordUser.discriminator,
                accessToken: discordUser.accessToken,
                discord_username: discordUser.discord_username,
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

    async getGuilds(user: DiscordUser) {
        const account = await this.findDiscordAccount(user._id);
        const axiosResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                authorization: `Bearer ${account.accessToken}`,
            },
        });
        return axiosResponse.data;
    }

    // TODO
    // async getGuildChannels(user: DiscordUser) {
    // }
    
}
