import bcrypt from 'bcrypt';

const Utils = {
    formatCacheKey(providerId: string, accountId: string, pollId: string) {
        return providerId + ':' + accountId + ':' + pollId;
    },

    cryptApiKey: async (apiKey: string) => {
        return bcrypt.genSalt(10)
            .then((salt => bcrypt.hash(apiKey, salt)))
            .then(hash => hash);
    },
    
    compareApiKey: async (apiKey: string, hash: string) => {
        return bcrypt.compare(apiKey, hash)
            .then(resp => resp);
    },

    validateKeyAgainstHashArray: async (apiKey: string, hashArray: Array<string>) => {
        for (const hash of hashArray.values()) {
            if (await bcrypt.compare(apiKey, hash)
                .then(resp => resp)) return hash;
        }
        return false;
    },

    shuffle: (str: string) => [...str].sort(()=>Math.random() - 0.5).join(''),

};

export default Utils;