export class DiscordUser {
    discord_username: string;
    discriminator: string;
    _id: string;
    avatar: string;
    provider_id: string;
    accessToken?: string;
    refreshToken?: string;
}

export class OauthSession {
    governatorId: string;
    status: number;
    // expires: string,
    oauthProfile: DiscordUser;
}