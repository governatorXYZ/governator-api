const Utils = {
    formatCacheKey(providerId: string, accountId: string, pollId: string) {
        return providerId + ':' + accountId + ':' + pollId;
    },
};

export default Utils;