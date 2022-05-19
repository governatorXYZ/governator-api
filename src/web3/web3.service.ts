import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import * as erc20json from './ERC20.json';
import { ERC20 } from './ERC20';
import { ERC20TokenBalanceDetail, ERC20TokenBalances } from './web3.dto';

@Injectable()
export class Web3Service {
    private readonly logger = new Logger(Web3Service.name);
    constructor() {
        // do nothing
    }

    async getTokenBalances(ethAddress, tokenList): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching token balances for account: ${ethAddress}`);

        if (tokenList.contractAddresses.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        try {
            ethers.utils.getAddress(ethAddress);
        } catch (e) {
            this.logger.error('Invalid Ethereum address');
            throw new HttpException(`Invalid Ethereum address ${e}`, HttpStatus.BAD_REQUEST);
        }

        const provider = ethers.providers.getDefaultProvider('mainnet');

        this.logger.debug(`current block number is: ${ await provider.getBlockNumber() }`);

        const tokenBalances = [];

        for (const tokenAddress of tokenList.contractAddresses) {

            try {

                ethers.utils.getAddress(tokenAddress);

                const tokenContract: ERC20 = new Contract(
                    tokenAddress,
                    erc20json.abi,
                ) as ERC20;

                const connectedToken = tokenContract.connect(provider);

                // https://docs.ethers.io/v5/api/providers/types/#providers-BlockTag
                // overrides.blockTag - a block tag to simulate the execution at, which can be used for hypothetical
                // historic analysis; note that many backends do not support this, or may require paid plans to access
                // as the node database storage and processing requirements are much higher
                const balanceBN = await connectedToken.balanceOf(ethAddress, { blockTag: 1000 });

                const tokenName = await connectedToken.name();

                const tokenSymbol = await connectedToken.symbol();

                const balance = Number(ethers.utils.formatEther(balanceBN));

                tokenBalances.push({
                    contractAddress: tokenAddress,
                    tokenName: tokenName,
                    tokenSymbol: tokenSymbol,
                    balance: balance,
                } as ERC20TokenBalanceDetail);

                this.logger.debug(`Balance of ${tokenName} (${tokenSymbol}): ${balance}`);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${tokenAddress}`, e);
            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }

    async verifySignature(message, signature) {
        return ethers.utils.verifyMessage(message, signature);
    }
}