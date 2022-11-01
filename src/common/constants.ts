export default Object.freeze({

    // supported providers
    PROVIDERS: new Map([
        ['discord', { methods: ['channels', 'roles'] }],
        ['ethereum', { methods: ['mainnnet', 'goerli'] }],
    ]),
    // SSE events
    EVENT_POLL_CREATE: 'POLL_CREATE',
    EVENT_POLL_UPDATE: 'POLL_UPDATE',
    EVENT_POLL_DELETE: 'POLL_DELETE',
    EVENT_POLL_COMPLETE: 'POLL_COMPLETE',
    EVENT_REQUEST_CLIENT_DATA: 'REQUEST_CLIENT_DATA',

    // SNAPSHOT
    SNAPSHOT_GRAPHQL_URL: 'https://hub.snapshot.org/graphql',

});