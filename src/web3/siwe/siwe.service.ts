import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EthereumAccountMongoService } from '../../account/ethereumAccount.mongo.service';
import { SiweMessage, SiweResponse, generateNonce } from 'siwe';
import { SiweNonceMongoService } from './siweNonce.mongo.service';
import { SiweVerifyDto } from './siwe.dtos';
import { UserMongoService } from '../../user/user.mongo.service';

@Injectable()
export class SiweService {
    private readonly logger = new Logger(SiweService.name);
    constructor(
        private ethereumAccountMongoService: EthereumAccountMongoService,
        private siweNonceMongoService: SiweNonceMongoService,
        private userMongoService: UserMongoService,
    ) {
        // do nothing
    }

    async getNonce(address): Promise<string> {
        const siweNonce = await this.siweNonceMongoService.createSiweNonce(address, generateNonce());

        return siweNonce.nonce;
    }

    async verifySignature(siweVerifyDto: SiweVerifyDto) {
        this.logger.log(`Verifying signature for address ${siweVerifyDto._id}`);

        const account = await this.ethereumAccountMongoService.findOneAccount({ _id: siweVerifyDto._id });

        if (!account) throw new HttpException('Failed to fetch account from db: Address not found', HttpStatus.BAD_REQUEST);

        let verificationResult: SiweResponse;
        let siweMessage: SiweMessage;
        try {

            siweMessage = new SiweMessage(siweVerifyDto.verification_message);

            this.logger.debug('SIWE message parsed successfully');

            this.logger.debug(siweMessage.toMessage());

            if (!(siweMessage.nonce === await this.verifyNonce(siweVerifyDto._id))) throw new Error('Nonce mismatch');

            verificationResult = await siweMessage.verify({ signature: siweVerifyDto.signed_message });

            this.logger.debug(JSON.stringify(verificationResult));

        } catch (e) {
            const error = e as Error;
            this.logger.error(error);
            throw new HttpException(`Address verification failed: ${ error.message }`, HttpStatus.EXPECTATION_FAILED);
        }

        if (!verificationResult.success) {
            this.logger.error(verificationResult.error);

            throw new HttpException('Signature did not match', HttpStatus.EXPECTATION_FAILED);
        }

        this.logger.log('Signature verification successful');

        account.signed_message = siweVerifyDto.signed_message;

        account.verification_message = siweMessage.toMessage();

        account.verified = true;

        if (siweVerifyDto.link_account.provider_id) {

            this.logger.debug('Updating user ID');

            const user = await this.userMongoService.fetchUserByProvider(siweVerifyDto.link_account.provider_id, siweVerifyDto.link_account._id);

            if (user.provider_accounts.length === 0) return;

            account.user_id = user._id;
        }

        this.logger.debug(`Updating eth account for address ${siweVerifyDto._id}`);

        return await this.ethereumAccountMongoService.findOneAndUpdateAccount({ _id: siweVerifyDto._id }, account).catch((e) => {
            this.logger.error('Failed to update account', e);

            throw new HttpException('Failed to update account', HttpStatus.BAD_REQUEST);
        });
    }

    async verifyNonce(address: string) {
        return this.siweNonceMongoService.findOneSiweNonce({ _id: address }).then((siweNonce) => siweNonce.nonce);
    }
}