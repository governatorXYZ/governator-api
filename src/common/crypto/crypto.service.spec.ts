import * as openpgp from 'openpgp';
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

describe('Create new openPGP key pair', () => {

    it('creates ecc pgp key pair', async () => {
        if (process.env.CREATE_KEYS) {
            await (async () => {

                const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                    // Type of the key, defaults to ECC
                    type: 'ecc',
                    // ECC curve name, defaults to curve25519
                    curve: 'curve25519',
                    // you can pass multiple user IDs
                    userIDs: [{ name: 'Governator API', email: 'governator@protonmail.com' }],
                    // // protects the private key
                    // passphrase: PGP_PASSPHRASE,
                    // output key format, defaults to 'armored' (other options: 'binary' or 'object')
                    format: 'armored',
                });

                // eslint-disable-next-line
                console.log(privateKey);
                // eslint-disable-next-line
                console.log(publicKey);
                // eslint-disable-next-line
                console.log(revocationCertificate);
            })();
        }
    });
});

describe('Test openPGPjs', () => {

    const PGP_PASSPHRASE = 'Rc$uR3fMrHU&L8V';
    const unencrypted = 'Hello, World!';

    it('tests encryption, decryption and signature validation with openPGP', async () => {
        await (async () => {
            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'ecc',
                curve: 'curve25519',
                userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }],
                passphrase: PGP_PASSPHRASE,
                format: 'armored',
            });

            const publicKeyDecrypted = await openpgp.readKey({ armoredKey: publicKey });

            const privateKeyDecrypted = await openpgp.decryptKey({
                privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
                passphrase: PGP_PASSPHRASE,
            });

            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: unencrypted }),
                encryptionKeys: publicKeyDecrypted,
                signingKeys: privateKeyDecrypted,
            });

            const message = await openpgp.readMessage({
                armoredMessage: encrypted,
            });

            const { data: decrypted, signatures } = await openpgp.decrypt({
                message,
                verificationKeys: publicKeyDecrypted,
                decryptionKeys: privateKeyDecrypted,
            });

            expect(encrypted).not.toEqual(unencrypted);
            expect(decrypted).toEqual(unencrypted);
            expect(await signatures[0].verified).toBe(true);
        })();
    });
});

describe('Test crypto.service openPGP', () => {
    let service: CryptoService;
    const BOB_PRIVATE = '-----BEGIN PGP PRIVATE KEY BLOCK-----\n\nxVgEYnOtsBYJKwYBBAHaRw8BAQdA47X5x/Y3BcMXBE22jLdvgBTxxpaPo4wyOE4Ekw2WW4cAAP4gBQeebzRRnnj8LG7wm+qNvlRHFobsGPHzgBXkYxiHQxAFzRtKb24gU21pdGggPGpvbkBleGFtcGxlLmNvbT7CjAQQFgoAHQUCYnOtsAQLCQcIAxUICgQWAAIBAhkBAhsDAh4BACEJEF6mepG+rMsOFiEEM6HKuqJp6IgNPiJjXqZ6kb6syw4HYwD/RnyP/z06DZTHaFSUgx2NHhqHErM1riVaPJWAisao0aQBAJhP1fzPqdP9TGin98dtpSRHuZ4N9YNE0BeVUJnU8aUFx10EYnOtsBIKKwYBBAGXVQEFAQEHQMM+nJugP87m1uE/1j33iLGjXXAs5/dhPwEgJOiPLlsYAwEIBwAA/3Hs1vndg8UbNIRbPjhzkd1SKtkzHfFA4tdMp0fbbaP4EoHCeAQYFggACQUCYnOtsAIbDAAhCRBepnqRvqzLDhYhBDOhyrqiaeiIDT4iY16mepG+rMsOWFcBAI4NxKFep0zYge1HYR3VmAumlkZGRysCv9f++eLESP9xAQCzPQ679nAJYdPDAt7+JpuKrm/31OkMVOj5DOuUMfJIDg===DAqx\n-----END PGP PRIVATE KEY BLOCK-----';
    const BOB_PUBLIC = '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxjMEYnOtsBYJKwYBBAHaRw8BAQdA47X5x/Y3BcMXBE22jLdvgBTxxpaPo4wyOE4Ekw2WW4fNG0pvbiBTbWl0aCA8am9uQGV4YW1wbGUuY29tPsKMBBAWCgAdBQJic62wBAsJBwgDFQgKBBYAAgECGQECGwMCHgEAIQkQXqZ6kb6syw4WIQQzocq6omnoiA0+ImNepnqRvqzLDgdjAP9GfI//PToNlMdoVJSDHY0eGocSszWuJVo8lYCKxqjRpAEAmE/V/M+p0/1MaKf3x22lJEe5ng31g0TQF5VQmdTxpQXOOARic62wEgorBgEEAZdVAQUBAQdAwz6cm6A/zubW4T/WPfeIsaNdcCzn92E/ASAk6I8uWxgDAQgHwngEGBYIAAkFAmJzrbACGwwAIQkQXqZ6kb6syw4WIQQzocq6omnoiA0+ImNepnqRvqzLDlhXAQCODcShXqdM2IHtR2Ed1ZgLppZGRkcrAr/X/vnixEj/cQEAsz0Ou/ZwCWHTwwLe/iabiq5v99TpDFTo+QzrlDHySA4==KfWs\n-----END PGP PUBLIC KEY BLOCK-----';
    const ALICE_PRIVATE = '-----BEGIN PGP PRIVATE KEY BLOCK-----\n\nxVgEYnPOTxYJKwYBBAHaRw8BAQdANTdYstxZKzmisbWn0vK3qUKRsdV1MxaFbZRfg9MJR38AAP9bIJUwBA7U0f41Ce+Aj2v3CoeZ4APdgVz2IG/7ZC7zohEAzRtKb24gU21pdGggPGpvbkBleGFtcGxlLmNvbT7CjAQQFgoAHQUCYnPOTwQLCQcIAxUICgQWAAIBAhkBAhsDAh4BACEJECXi1HemBoJ1FiEEI0hN7YbUxfOxCvtKJeLUd6YGgnVtCQEA9TTIR/xix+IGFdvVMHyyHUuD6Mxw5ve+axGXyxGbAyQA/1NT4//QRaQdNmUys/Dv+TL27i+vNbzYOuvztKlU9CAKx10EYnPOTxIKKwYBBAGXVQEFAQEHQBwyixqJqx8VgODb5SJRPI0ZpldBdYDikUpBDuzE5fEkAwEIBwAA/0YI3HMHQ124GCAN4A5xmh3imducHKCmTAWWXg1lm7lADfXCeAQYFggACQUCYnPOTwIbDAAhCRAl4tR3pgaCdRYhBCNITe2G1MXzsQr7SiXi1HemBoJ1hMkBAPFGYQvlPXfRt8WCG8DekG3p7jYCE8ZXWZjV/n139K8vAP9ICD3mMq6TcOv9Qlu3mwIVpDUbNKUARiXi+v1yx0A5Aw===gX7G\n-----END PGP PRIVATE KEY BLOCK-----';
    const ALICE_PUBLIC = '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxjMEYnPOTxYJKwYBBAHaRw8BAQdANTdYstxZKzmisbWn0vK3qUKRsdV1MxaFbZRfg9MJR3/NG0pvbiBTbWl0aCA8am9uQGV4YW1wbGUuY29tPsKMBBAWCgAdBQJic85PBAsJBwgDFQgKBBYAAgECGQECGwMCHgEAIQkQJeLUd6YGgnUWIQQjSE3thtTF87EK+0ol4tR3pgaCdW0JAQD1NMhH/GLH4gYV29UwfLIdS4PozHDm975rEZfLEZsDJAD/U1Pj/9BFpB02ZTKz8O/5MvbuL681vNg66/O0qVT0IArOOARic85PEgorBgEEAZdVAQUBAQdAHDKLGomrHxWA4NvlIlE8jRmmV0F1gOKRSkEO7MTl8SQDAQgHwngEGBYIAAkFAmJzzk8CGwwAIQkQJeLUd6YGgnUWIQQjSE3thtTF87EK+0ol4tR3pgaCdYTJAQDxRmEL5T130bfFghvA3pBt6e42AhPGV1mY1f59d/SvLwD/SAg95jKuk3Dr/UJbt5sCFaQ1GzSlAEYl4vr9csdAOQM==q6GM\n-----END PGP PUBLIC KEY BLOCK-----';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CryptoService, ConfigService],
        }).compile();

        service = module.get<CryptoService>(CryptoService);
    });

    it('tests encrypt, decrypt and signature validation', async () => {

        const secret = 'Hello World!';
        const aliceToBobEncrypted = await service.encryptPgp(BOB_PUBLIC, secret, ALICE_PRIVATE);
        const BobFromAliceDecrypted = await service.decryptPgp(ALICE_PUBLIC, aliceToBobEncrypted, BOB_PRIVATE);

        // encrypt & decrypt correctly
        expect(aliceToBobEncrypted).not.toEqual(secret);
        expect(BobFromAliceDecrypted).toEqual(secret);

        const { privateKey } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }],
            format: 'armored',
        });

        // throws error if bad signature
        const aliceToBobBadSig = await service.encryptPgp(BOB_PUBLIC, secret, privateKey);
        await expect(service.decryptPgp(ALICE_PUBLIC, aliceToBobBadSig, BOB_PRIVATE)).rejects.toThrow();

        // throws error if bad dercryption key
        await expect(service.decryptPgp(ALICE_PUBLIC, aliceToBobEncrypted, privateKey)).rejects.toThrow();
    });
});

describe('Test crypto.service AES-256-CTR', () => {
    let service: CryptoService;
    const iv = randomBytes(16);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CryptoService, ConfigService],
        }).compile();

        service = module.get<CryptoService>(CryptoService);
    });

    it('tests cypher and decypher', async () => {

        const secret = 'Hello World!';
        const cypher = await service.aesCypher(secret, iv, 'password');
        const decypher = await service.aesDecypher(cypher, iv, 'password');

        expect(cypher).not.toEqual(secret);
        expect(decypher).toEqual(secret);
        expect(await service.aesDecypher(cypher, iv, 'wrong password')).not.toEqual(secret);
    });
});