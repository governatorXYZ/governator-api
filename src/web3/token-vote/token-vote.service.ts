import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import * as erc20json from './ERC20.json';
import * as erc721json from './ERC721.json';
import * as erc1155json from './ERC1155.json';
import { ERC20 } from './ERC20';
import { ERC721 } from './ERC721';
import { ERC1155 } from './ERC1155';
import {
    ERC1155BalanceOfDto,
    ERC20TokenBalanceDetail,
    ERC20TokenBalances, ERC721OwnerOfDto,
    TokenList,
} from './token-vote.dtos';
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
    async getErc20TokenBalances(ethAddress: string, tokenList: TokenList, blockNumber = null): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching ERC20 token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {
                const connectedToken = await this.connectContract(token.contractAddress, erc20json.abi, token.chain_id) as ERC20;

                tokenBalances.push({
                    contractAddress: token.contractAddress,
                    tokenName: await connectedToken.name(),
                    tokenSymbol: await connectedToken.symbol(),
                    balance: Number(await connectedToken.balanceOf(ethAddress, { blockTag: blockNumber ? blockNumber : 'latest' })),
                    chain_id: token.chain_id,
                } as ERC20TokenBalanceDetail);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${token.contractAddress}`, e);

            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }

    async getErc721TokenBalances(ethAddress: string, tokenList: TokenList, blockNumber = null): Promise<ERC20TokenBalances> {
        this.logger.log(`Fetching ERC721 token balances for account: ${ethAddress}`);

        if (tokenList.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const tokenBalances = [];

        for (const token of tokenList.tokens) {

            try {
                const connectedToken = await this.connectContract(token.contractAddress, erc721json.abi, token.chain_id) as ERC721;

                tokenBalances.push({
                    contractAddress: token.contractAddress,
                    balance: Number(await connectedToken.balanceOf(ethAddress, { blockTag: blockNumber ? blockNumber : 'latest' })),
                    chain_id: token.chain_id,
                } as ERC20TokenBalanceDetail);

            } catch (e) {
                this.logger.error(`failed to fetch token with address ${token.contractAddress}`, e);
            }
        }

        return { account: ethAddress, tokenBalances: tokenBalances } as ERC20TokenBalances;
    }

    async getErc721OwnerOf(ownerOfDto: ERC721OwnerOfDto, blockNumber = null): Promise<string[]> {
        this.logger.log(`Fetching ERC721 token owners for contract ${ownerOfDto.contractAddress}`);

        if (ownerOfDto.tokens.length === 0) throw new HttpException('Failed to fetch token balances', HttpStatus.BAD_REQUEST);

        const connectedToken = await this.connectContract(ownerOfDto.contractAddress, erc721json.abi, ownerOfDto.chain_id) as ERC721;

        const tokenOwners = [];

        for (const tokenId of ownerOfDto.tokens) {
            let owner = null;

            try {
                owner = await connectedToken.ownerOf(tokenId, { blockTag: blockNumber ? blockNumber : 'latest' });

            } catch (e) {
                this.logger.error(`failed to fetch owner for token ID ${tokenId}`, e);
                owner = null;
            }

            if (owner) tokenOwners.push(owner);
        }

        return tokenOwners;
    }

    async getErc1155BalanceOf(ownerAddress: string, balanceOfDto: ERC1155BalanceOfDto, blockNumber = null): Promise<number> {
        this.logger.log(`Fetching ERC721 token owner for contract ${balanceOfDto.contractAddress}`);

        const connectedToken = await this.connectContract(balanceOfDto.contractAddress, erc1155json.abi, balanceOfDto.chain_id) as ERC1155;

        try {
            return Number(await connectedToken.balanceOf(ownerAddress, balanceOfDto.token_id, { blockTag: blockNumber ? blockNumber : 'latest' }));

        } catch (e) {
            this.logger.error(`failed to fetch owner for token ID ${balanceOfDto.token_id}`, e);
            return null;
        }
    }

    async connectContract(tokenAddress, abi, chain_id) {
        this.logger.debug(`Connecting token contract for: ${ tokenAddress }`);

        const provider = ethers.providers.getDefaultProvider(chain_id);

        const tokenContract = new Contract(
            tokenAddress,
            abi,
        );

        return tokenContract.connect(provider);
    }

}