import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import * as erc20json from './ERC20.json';
import { ERC20 } from './ERC20';
import {
    ERC20TokenBalanceDetail,
    ERC20TokenBalances,
    TokenList,
} from '../web3.dto';
import { EthereumAccountMongoService } from '../../account/ethereumAccount.mongo.service';

@Injectable()
export class TokenVoteService {
    private readonly logger = new Logger(TokenVoteService.name);
    constructor(
        @Inject(forwardRef(() => EthereumAccountMongoService))
        private ethereumAccountMongoService: EthereumAccountMongoService,
    ) {
        // do nothing
    }

    // FIXME this function does not validate if the provided contract is indeed ERC20 token contract.
    // https://ethereum.stackexchange.com/questions/113329/is-there-a-way-to-get-an-interface-id-of-a-solidity-interface-using-ethersjs
    async getErc20TokenBalances(ethAddress: string, tokenList: TokenList): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {

                const provider = ethers.providers.getDefaultProvider(token.chain_id);

                this.logger.debug(`current block number is: ${ await provider.getBlockNumber() }`);

                const tokenContract: ERC20 = new Contract(
                    token.contractAddresses,
                    erc20json.abi,
                ) as ERC20;

                const connectedToken = tokenContract.connect(provider);

                // https://docs.ethers.io/v5/api/providers/types/#providers-BlockTag
                // overrides.blockTag - a block tag to simulate the execution at, which can be used for hypothetical
                // historic analysis; note that many backends do not support this, or may require paid plans to access
                // as the node database storage and processing requirements are much higher
                const balanceBN = await connectedToken.balanceOf(ethAddress, { blockTag: -100 });

                const tokenName = await connectedToken.name();

                const tokenSymbol = await connectedToken.symbol();

                const balance = Number(ethers.utils.formatEther(balanceBN));

                tokenBalances.push({
                    contractAddress: token.contractAddresses,
                    tokenName: tokenName,
                    tokenSymbol: tokenSymbol,
                    balance: balance,
                    chain_id: token.chain_id,
                } as ERC20TokenBalanceDetail);

                this.logger.debug(`Balance of ${tokenName} (${tokenSymbol}): ${balance}`);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${token.contractAddresses}`, e);
            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }
}