import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Contract } from 'ethers';
import * as erc20json from './ERC20.json';
import * as erc721json from './ERC721.json';
import * as erc1155json from './ERC1155.json';
import {
    ERC1155BalanceOfDto,
    ERC20TokenBalanceDetail,
    ERC20TokenBalances, ERC721OwnerOfDto, ERC721OwnerOfResponseDto,
    TokenList,
} from './evm.dtos';
import { EthereumAccountMongoService } from '../../../account/ethereumAccount.mongo.service';
import web3Utils from '../../web3.util';

@Injectable()
export class EvmService {
    private readonly logger = new Logger(EvmService.name);
    private providers = {};
    constructor(
        @Inject(forwardRef(() => EthereumAccountMongoService))
        private ethereumAccountMongoService: EthereumAccountMongoService,
    ) {
        // do nothing
    }

    // FIXME this function does not validate if the provided contract is indeed ERC20 token contract.
    // https://ethereum.stackexchange.com/questions/113329/is-there-a-way-to-get-an-interface-id-of-a-solidity-interface-using-ethersjs
    async getErc20TokenBalances(ethAddress: string, tokenList: TokenList): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching ERC20 token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {
                const tokenContract = await this.getContract(token.contractAddress, erc20json.abi, token.chain_id);

                // const blockNumber = (!token.block_height) ? await web3Utils.getEthersProvider(token.chain_id).getBlockNumber() : token.block_height;

                tokenBalances.push({
                    contractAddress: token.contractAddress,
                    tokenName: await tokenContract.name(),
                    tokenSymbol: await tokenContract.symbol(),
                    balance: (await tokenContract.balanceOf(ethAddress, { blockTag: token.block_height })).toString(),
                    chain_id: token.chain_id,
                    block_height: token.block_height,
                } as ERC20TokenBalanceDetail);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${token.contractAddress}`, e);

            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }

    async getErc721TokenBalances(ethAddress: string, tokenList: TokenList): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching ERC721 token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {
                const tokenContract = await this.getContract(token.contractAddress, erc721json.abi, token.chain_id);

                const blockNumber = (!token.block_height) ? await web3Utils.getEthersProvider(token.chain_id).getBlockNumber() : token.block_height;

                tokenBalances.push({
                    contractAddress: token.contractAddress,
                    balance: (await tokenContract.balanceOf(ethAddress, { blockTag: blockNumber ? blockNumber : 'latest' })).toString(),
                    chain_id: token.chain_id,
                    block_height: blockNumber,
                } as ERC20TokenBalanceDetail);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${token.contractAddress}`, e);
            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }

    async getErc721OwnerOf(ownerOfDto: ERC721OwnerOfDto): Promise<ERC721OwnerOfResponseDto> {
        this.logger.log(`Fetching ERC721 token owners for contract ${ownerOfDto.contractAddress}`);

        if (ownerOfDto.token_ids.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenContract = await this.getContract(ownerOfDto.contractAddress, erc721json.abi, ownerOfDto.chain_id);

        const blockNumber = (!ownerOfDto.block_height) ? await web3Utils.getEthersProvider(ownerOfDto.chain_id).getBlockNumber() : ownerOfDto.block_height;

        const tokenOwners = [];

        for (const tokenId of ownerOfDto.token_ids) {
            let owner = null;

            try {
                owner = await tokenContract.ownerOf(tokenId.token_id, { blockTag: blockNumber ? blockNumber : 'latest' });

            } catch (e) {
                this.logger.error(`failed to fetch owner for token ID ${tokenId}`, e);
                owner = null;
            }

            if (owner) tokenOwners.push(owner);
        }

        return { contractAddress: ownerOfDto.contractAddress, block_height: blockNumber, owners: tokenOwners, chain_id: ownerOfDto.chain_id };
    }

    async getErc1155BalanceOf(ownerAddress: string, balanceOfDto: ERC1155BalanceOfDto): Promise<number> {
        this.logger.log(`Fetching ERC721 token owner for contract ${balanceOfDto.contractAddress}`);

        const tokenContract = await this.getContract(balanceOfDto.contractAddress, erc1155json.abi, balanceOfDto.chain_id);

        const blockNumber = (!balanceOfDto.block_height) ? await web3Utils.getEthersProvider(balanceOfDto.chain_id).getBlockNumber() : balanceOfDto.block_height;

        try {
            return Number(await tokenContract.balanceOf(ownerAddress, balanceOfDto.token_id, { blockTag: blockNumber ? blockNumber : 'latest' }));

        } catch (e) {
            this.logger.error(`failed to fetch owner for token ID ${balanceOfDto.token_id}`, e);
            return null;
        }
    }

    async getContract(tokenAddress: string, abi: any, chainId: number) {
        this.logger.debug(`Connecting token contract for: ${ tokenAddress }`);

        const provider = web3Utils.getEthersProvider(chainId);

        const tokenContract = new Contract(
            tokenAddress,
            abi,
            provider,
        );

        return tokenContract;
    }

    async getEthersProvider(chainId) {
        this.logger.log(`getting provider for chain ID ${chainId}`);

        if (this.providers[chainId.toString()]) return this.providers[chainId.toString()];

        this.providers[chainId.toString()] = await web3Utils.getEthersProvider(chainId);

        return this.providers[chainId.toString()];
    }

}