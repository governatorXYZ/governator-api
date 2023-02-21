export type UserData = {
    username: string,
    discriminator: string,
    discordId: string,
    avatar: string,
}

export interface AuthProvider {
    validateUser(userData: UserData),
    createUser(),
    findUser(),
}