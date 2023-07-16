export const fixtures = new function(this: any) {
    this.poll = {
        _id: '6496a711382525271b225a50',
        title: 'Test Poll',
        client_config: [
            {
                provider_id: 'discord',
                guild_id: '1234567890',
                channel_id: '1234567890',
                role_restrictions: ['1234567890', '1234567890'],
            },
        ],
        poll_options: [
            {
                poll_option_id: 'ad271e7c-1554-41a3-a0ff-ba6f7f54cdb4',
                poll_option_name: 'option1',
                poll_option_emoji: ':/',
            },
            {
                poll_option_id: 'ad271e7c-1554-41a3-a0ff-ba6f7f54cdb5',
                poll_option_name: 'option2',
                poll_option_emoji: ':\\',
            },
        ],
        strategy_config: [
            {
                strategy_type: 'ONE_EQUALS_ONE',
                strategy_id: '13a9ec406bb19ec6916208eb9282b9c9',
                block_height: [{
                    chain_id: '1',
                    block: 17548235,
                },
                {
                    block: 44276138,
                    chain_id: '137',
                }],
            },
        ],
        allow_options_for_anyone: true,
        single_vote: true,
        end_time: '2023-06-24T08:21:04.319Z',
        description: 'hello world',
        author_user_id: '999a8681e47db28bf0000111',
        __v: 0,
    };
    this.user = {
        _id: '629e25279d35735622b1f960',
        provider_accounts: [
            {
                _id: '0x25acDd75b45dd76AD6633b5400cE633c0B03c50e',
                user_id: '629e25279d35735622b1f960',
                provider_id: 'ethereum',
                verified: false,
                createdAt: '2023-01-26T21:19:58.691Z',
                updatedAt: '2023-01-26T21:19:58.708Z',
                __v: 0,
            },
            {
                _id: '0x33ad3066B03Dd0f3956645621Bbee859a4F6cacE',
                user_id: '629e25279d35735622b1f960',
                provider_id: 'ethereum',
                verified: true,
                createdAt: '2023-05-23T11:07:31.344Z',
                updatedAt: '2023-05-23T11:07:50.123Z',
                __v: 0,
                signed_message: '0x14d969cb6',
                verification_message: 'some message',
            },
            {
                _id: '0xd78cdb879acc67b000588b027328af4626f0b0ef',
                user_id: '629e25279d35735622b1f960',
                provider_id: 'ethereum',
                verified: true,
                createdAt: '2023-05-23T11:07:31.344Z',
                updatedAt: '2023-05-23T11:07:50.123Z',
                __v: 0,
                signed_message: '0x14d969cb63',
                verification_message: 'some message',
            },
            {
                _id: '123456789',
                user_id: '629e25279d35735622b1f960',
                provider_id: 'discord',
                discord_username: 'User',
                createdAt: '2022-06-06T16:02:47.423Z',
                updatedAt: '2023-05-22T01:45:29.155Z',
                __v: 0,
                avatar: '7cfd2edea215beb15a6768e',
                discriminator: '0000',
            },
        ],
    };
    this.voteCreate =
        {
            method: 'create',
            data: {
                _id: '6496beba0fd3425565551753',
                poll_id: '6496beb90fd342556555174e',
                poll_option_id: '110631fa-3fbb-41c9-8718-b26ca4a40af4',
                account_id: '123456789',
                provider_id: 'discord',
                vote_power: '1',
                __v: 0,
            },
        };
    this.voteDelete =
        {
            method: 'delete',
            data: {
                _id: '6496beba0fd3425565551753',
                poll_id: '6496beb90fd342556555174e',
                poll_option_id: '110631fa-3fbb-41c9-8718-b26ca4a40af5',
                account_id: '123456789',
                provider_id: 'discord',
                vote_power: '1',
                __v: 0,
            },
        };
};