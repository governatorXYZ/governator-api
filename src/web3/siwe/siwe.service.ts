import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { EthereumAccountVerifyDto } from '../web3.dto';
import { EthereumAccountMongoService } from '../../account/ethereumAccount.mongo.service';
import { SiweMessage, SiweResponse } from 'siwe';

@Injectable()
export class SiweService {
    private readonly logger = new Logger(SiweService.name);
    constructor(
        @Inject(forwardRef(() => EthereumAccountMongoService))
        private ethereumAccountMongoService: EthereumAccountMongoService,
    ) {
        // do nothing
    }

    async verifySignature(ethAddressVerificationDto: EthereumAccountVerifyDto) {
        this.logger.log(`Verifying signature for address ${ethAddressVerificationDto._id}`);

        const account = await this.ethereumAccountMongoService.findOneAccount({ _id: ethAddressVerificationDto._id });

        if (!account) throw new HttpException('Failed to fetch account from db: Ethereum address not found', HttpStatus.BAD_REQUEST);

        let verificationResult: SiweResponse;
        let siweMessage: SiweMessage;
        try {

            siweMessage = new SiweMessage(ethAddressVerificationDto.verification_message);

            this.logger.debug(siweMessage.toMessage());

            // if (!(siweMessage.nonce === account.nonce)) throw new Error('Nonce missmatch');

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
}