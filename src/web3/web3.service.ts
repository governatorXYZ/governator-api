import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import * as erc20json from './ERC20.json';
import { ERC20 } from './ERC20';
import {
    ERC20TokenBalanceDetail,
    ERC20TokenBalances,
    EthereumAccountVerifyDto, TokenList,
} from './web3.dto';
import { EthereumAccountMongoService } from '../account/ethereumAccount.mongo.service';
import { SiweMessage, SiweResponse } from 'siwe';

@Injectable()
export class Web3Service {
    private readonly logger = new Logger(Web3Service.name);
    constructor(
        @Inject(forwardRef(() => EthereumAccountMongoService))
        private ethereumAccountMongoService: EthereumAccountMongoService,
    ) {
        // do nothing
    }

    // FIXME this function does not validate if the provided contract is indeed ERC20 token contract.
    // https://ethereum.stackexchange.com/questions/113329/is-there-a-way-to-get-an-interface-id-of-a-solidity-interface-using-ethersjs
    async getERC20TokenBalances(ethAddress: string, tokenList: TokenList): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {

                // TODO test if this works
                // validates contract address, but should be done by DTO already
                // const x = ethers.utils.getAddress(tokenAddress);

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

    async verifySignature(ethAddressVerificationDto: EthereumAccountVerifyDto) {
        this.logger.log(`Verifying signature for address ${ethAddressVerificationDto._id}`);

        const account = await this.ethereumAccountMongoService.findOneAccount({ _id: ethAddressVerificationDto._id });

        if (!account) throw new HttpException('Failed to fetch account from db: Ethereum address not found', HttpStatus.BAD_REQUEST);

        // if (account.verified) throw new HttpException('Account already verified', HttpStatus.BAD_REQUEST);

        let verificationResult: SiweResponse;
        let siweMessage: SiweMessage;
        try {

            siweMessage = new SiweMessage(ethAddressVerificationDto.verification_message);

            this.logger.debug(siweMessage.toMessage());

            if (!(siweMessage.nonce === account.nonce)) throw new Error('Nonce missmatch');

            verificationResult = await siweMessage.verify({ signature: ethAddressVerificationDto.signed_message });

            this.logger.debug(JSON.stringify(verificationResult));

        } catch (e) {
            this.logger.error(e);
            throw new HttpException('Address verification failed', HttpStatus.EXPECTATION_FAILED);
        }

        if (!verificationResult.success) {
            this.logger.error(verificationResult.error);

            throw new HttpException('Address verification failed', HttpStatus.EXPECTATION_FAILED);
        }

        this.logger.log('Signature verification successful');

        account.signed_message = ethAddressVerificationDto.signed_message;

        account.verification_message = siweMessage.toMessage();

        account.verified = true;

        this.logger.log(`Updating eth account for address ${ethAddressVerificationDto._id}`);

        return await this.ethereumAccountMongoService.findOneAndUpdateAccount({ _id: ethAddressVerificationDto._id }, account).catch((e) => {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        });
    }

    // generateVerificationMessage(address) {
    //
    //     const domain = 'localhost';
    //     const origin = 'http://localhost';
    //     const statement = constants.SIWE_STATEMENT;
    //     // const resources = ['124356678299'];
    //
    //     const siweMessage = new siwe.SiweMessage({
    //         domain,
    //         address,
    //         statement,
    //         uri: origin,
    //         version: '1',
    //         chainId: 1,
    //         // resources: resources,
    //     });
    //
    //     this.logger.debug(siweMessage);
    //     this.logger.debug(JSON.stringify(siweMessage));
    //
    //     return siweMessage.prepareMessage();
    // }
}