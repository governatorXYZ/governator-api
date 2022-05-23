import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import * as erc20json from './ERC20.json';
import { ERC20 } from './ERC20';
import {ERC20TokenBalanceDetail, ERC20TokenBalances, EthAddressVerificationDto} from './web3.dto';
import { EthereumAccount } from '../account/account.dtos';
import { AccountMongoService } from '../account/account.mongo.service';

@Injectable()
export class Web3Service {
    private readonly logger = new Logger(Web3Service.name);
    constructor(
        protected accountMongoService: AccountMongoService,
    ) {
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

                // const x = ethers.utils.getAddress(tokenAddress);

                const tokenContract: ERC20 = new Contract(
                    tokenAddress,
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

    async verifySignature(ethAddressVerificationDto: EthAddressVerificationDto) {
        this.logger.log(`Verifying signature for address ${ethAddressVerificationDto.address}`);

        const account = await this.accountMongoService.findOneAccount({ user_id: ethAddressVerificationDto.user_id, provider_id: 'ethereum' });

        if (!account) throw new HttpException('userId not found. Failed to fetch account from db', HttpStatus.BAD_REQUEST);

        const verifiedAccount = await this.accountMongoService.findOneAccount({ provider_id: 'ethereum', 'provider_account.provider_account_id': ethAddressVerificationDto.address, verified: true }).catch(() => null);

        if (verifiedAccount) throw new HttpException('Account already verified', HttpStatus.BAD_REQUEST);

        // const message = (account.provider_account as EthereumAccount).verification_message;

        const message = ethAddressVerificationDto.verification_message;

        let signerAddress: string;
        try {
            signerAddress = ethers.utils.verifyMessage(message, ethAddressVerificationDto.signature);

        } catch (e) {
            this.logger.error(e);
            signerAddress = null;
        }

        if (!(signerAddress === ethAddressVerificationDto.address)) throw new HttpException('Address verification failed, signature did not match', HttpStatus.EXPECTATION_FAILED);

        this.logger.log('Signature verification successful');

        this.logger.debug(`${signerAddress} = ${ethAddressVerificationDto.address}`);

        (account.provider_account as unknown as EthereumAccount).signed_message = ethAddressVerificationDto.signature;

        (account.provider_account as unknown as EthereumAccount).verified = true;

        (account.provider_account as unknown as EthereumAccount).provider_account_id = signerAddress;

        (account.provider_account as unknown as EthereumAccount).verification_message = ethAddressVerificationDto.verification_message;

        this.logger.log(`Ethereum user account updated for user ${ethAddressVerificationDto.user_id}`);

        return await this.accountMongoService.findByIdAndUpdateAccount(account._id, account).catch((e) => {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        });
    }

    // async getVerificationMessage(ethAddress) {
    //     try {
    //         const account = await this.accountMongoService.findOneAccount({ provider_id: 'ethereum', 'provider_account.provider_account_id': ethAddress });
    //
    //         return (account.provider_account as EthereumAccount).verification_message;
    //
    //     } catch (e) {
    //         this.logger.error('Failed to fetch account from db', e);
    //
    //         throw new HttpException('Failed to fetch account', HttpStatus.BAD_REQUEST);
    //     }
    // }
}