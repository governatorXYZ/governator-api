import { Injectable, Logger } from '@nestjs/common';
import * as openpgp from 'openpgp';
import { createCipheriv, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
    private readonly logger = new Logger(CryptoService.name);
    constructor(private readonly configService:ConfigService) {
        // do nothing
    }

    async aesDecypher(encrypted, iv, password = this.configService.get('ENCRYPTION_PW')) {
        this.logger.log('AES decypher started');

        if (!password) throw new Error('no password provided');
        const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

        const decipher = createDecipheriv('aes-256-ctr', key, iv);
        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]).toString();
    }

    async aesCypher(unencrypted, iv, password = this.configService.get('ENCRYPTION_PW')) {
        this.logger.log('AES cypher started');

        if (!password) throw new Error('no password provided');
        // The key length is dependent on the algorithm.
        // In this case for aes256, it is 32 bytes.
        const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
        const cipher = createCipheriv('aes-256-ctr', key, iv);

        return Buffer.concat([
            cipher.update(unencrypted),
            cipher.final(),
        ]);
    }

    async encryptPgp(publicKey, message, signingKey = this.configService.get('PGP_PRIVATE_KEY')) {
        this.logger.log('PGP encryption started');

        if (!signingKey) throw new Error('no pgp private key supplied in .env');

        this.logger.debug(`using public key ${publicKey}`);

        const publicKeyDecrypted = await openpgp.readKey({ armoredKey: publicKey });

        const privateKeyDecrypted = await openpgp.readPrivateKey({ armoredKey: signingKey });

        // TODO: find out how private key can be exported in encrypted format
        // const privateKeyDecrypted = await openpgp.decryptKey({
        //     privateKey: await openpgp.readPrivateKey({ armoredKey: process.env.PGP_PRIVATE_KEY }),
        //     passphrase: process.env.PGP_PASSPHRASE,
        // });

        const encrypted = await openpgp.encrypt({
            // input as Message object
            message: await openpgp.createMessage({ text: message }),
            encryptionKeys: publicKeyDecrypted,
            // optional
            signingKeys: privateKeyDecrypted,
        }).catch(() => null);

        if (!encrypted) {
            throw new Error('Failed to encrypt');
        }

        this.logger.debug(`encryped message: ${encrypted}`);

        return encrypted;
    }

    async decryptPgp(publicKey, encrypted, decryptionKey = this.configService.get('PGP_PRIVATE_KEY')) {
        if (!decryptionKey) throw new Error('no pgp private key / decryption key provided');

        this.logger.log('PGP decryption started');
        this.logger.debug(`public key used to validate signature ${publicKey}`);

        const publicKeyDecrypted = await openpgp.readKey({ armoredKey: publicKey });

        const privateKeyDecrypted = await openpgp.readPrivateKey({ armoredKey: decryptionKey });

        // TODO: find out how private key can be exported in encrypted format
        // const privateKeyDecrypted = await openpgp.decryptKey({
        //     privateKey: await openpgp.readPrivateKey({ armoredKey: pGP_PRIVATE_KEY }),
        //     passphrase: pGP_PASSPHRASE,
        // });

        const message = await openpgp.readMessage({
            // parse armored message
            armoredMessage: encrypted,
        });

        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            // optional - to verify signature
            verificationKeys: publicKeyDecrypted,
            decryptionKeys: privateKeyDecrypted,
        }).catch((e) => e);

        if (!decrypted) {
            throw new Error('Failed to decrypt');
        }

        // check signature validity (signed messages only)
        try {
            // throws on invalid signature
            await signatures[0].verified;
            this.logger.log('Signature is valid');
            return decrypted;
        } catch (e) {
            throw new Error('Signature could not be verified: ' + e);
        }
    }
}