export const strategyTypes = Object.freeze({
    STRATEGY_TYPE_TOKEN_WEIGHTED: 'TOKEN_WEIGHTED',
    STRATEGY_TYPE_ONE_EQUALS_ONE: 'ONE_EQUALS_ONE',
    STRATEGY_TYPE_TOKEN_GATED: 'TOKEN_GATED',
});

export default Object.freeze({

    // supported providers
    PROVIDERS: new Map([
        ['discord', { methods: ['channels', 'roles'] }],
        ['ethereum', { methods: ['mainnnet', 'goerli'] }],
    ]),
    STRATEGY_TYPES: [strategyTypes.STRATEGY_TYPE_ONE_EQUALS_ONE, strategyTypes.STRATEGY_TYPE_TOKEN_WEIGHTED],
    // SSE events
    EVENT_POLL_CREATE: 'POLL_CREATE',
    EVENT_POLL_UPDATE: 'POLL_UPDATE',
    EVENT_POLL_DELETE: 'POLL_DELETE',
    EVENT_POLL_COMPLETE: 'POLL_COMPLETE',
    EVENT_REQUEST_CLIENT_DATA: 'REQUEST_CLIENT_DATA',
    EVENT_HEARTBEAT: 'HEARTBEAT',
    EVENT_VOTE_CREATE: 'VOTE_CREATE',

    // SNAPSHOT
    SNAPSHOT_GRAPHQL_URL: 'https://hub.snapshot.org/graphql',

    SUPPORTED_CHAIN_IDS: ['1', '137'],

});