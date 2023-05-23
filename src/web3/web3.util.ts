import { ethers } from 'ethers';
// import snapshot from '@snapshot-labs/snapshot.js';


// FIXME: make robust for multi chain
const web3Utils = {
    getEthersProvider(chainId: number) {
        switch (chainId) {
        
        // eth mainnet
        case 1:
            return new ethers.AlchemyProvider(chainId, process.env.ALCHEMY_API_KEY_ETHEREUM_MAIN);

        // polygon
        case 137:
            // TODO try some different providers here and only return if it is working.
            return new ethers.AlchemyProvider(chainId, process.env.ALCHEMY_API_KEY_POLYGON_MAIN);
        
        // gnosis
        case 100:
            return new ethers.JsonRpcProvider('https://rpc.gnosis.gateway.fm');

        default:
            return ethers.getDefaultProvider(chainId, {
                alchemy: process.env.ALCHEMY_API_KEY_ETHEREUM_MAIN,
                infura: process.env.INFURA_ETHEREUM_MAIN_ID,
                etherscan: process.env.ETHERSCAN_API_KEY,
            });
        }
    },
};

export default web3Utils;