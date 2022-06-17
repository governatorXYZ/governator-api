import { ethers } from 'ethers';
import snapshot from '@snapshot-labs/snapshot.js';

const web3Utils = {
    getEthersProvider(chainId) {
        switch (chainId) {
        case 1:
            return new ethers.providers.InfuraProvider(chainId, {
                project_id: process.env.INFURA_ETHEREUM_MAIN_ID,
                project_secret: process.env.INFURA_ETHEREUM_MAIN_SECRET,
            });
        case 137:
            // return new ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_API_KEY_POLYGON_MAIN);
            // return snapshot.utils.getProvider('137');
            return new ethers.providers.StaticJsonRpcProvider({
                url: 'https://speedy-nodes-nyc.moralis.io/b9aed21e7bb7bdeb35972c9a/polygon/mainnet/archive',
                timeout: 25000,
            }, chainId);

        default:
            return snapshot.utils.getProvider(chainId.toString());
            // return ethers.providers.getDefaultProvider(chainId, {
            //     alchemy: process.env.ALCHEMY_API_KEY_ETHEREUM_MAIN,
            //     infura: process.env.INFURA_ETHEREUM_MAIN_ID,
            //     etherscan: process.env.ETHERSCAN_API_KEY,
            // });
        }
    },
};

export default web3Utils;