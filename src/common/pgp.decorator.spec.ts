import * as openpgp from 'openpgp';
import * as crypto from 'crypto';
// const crypto = require('crypto');


describe('Create Key', () => {

    it('creates ecc pgp key pair', async () => {
        await (async () => {
            const passphrase = 'yourPassphrase'; // what the private key is encrypted with

            const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                type: 'ecc', // Type of the key, defaults to ECC
                curve: 'curve25519', // ECC curve name, defaults to curve25519
                userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }], // you can pass multiple user IDs
                passphrase: passphrase, // protects the private key
                format: 'armored', // output key format, defaults to 'armored' (other options: 'binary' or 'object')
            });


            const publicKeyDecrypted = await openpgp.readKey({ armoredKey: publicKey });

            const privateKeyDecrypted = await openpgp.decryptKey({
                privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
                passphrase,
            });

            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: 'Hello, World!' }), // input as Message object
                encryptionKeys: publicKeyDecrypted,
                signingKeys: privateKeyDecrypted // optional
            });
            console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

            const message = await openpgp.readMessage({
                armoredMessage: encrypted // parse armored message
            });
            const { data: decrypted, signatures } = await openpgp.decrypt({
                message,
                verificationKeys: publicKeyDecrypted, // optional
                decryptionKeys: privateKeyDecrypted
            });
            console.log(decrypted); // 'Hello, World!'
            // check signature validity (signed messages only)
            try {
                await signatures[0].verified; // throws on invalid signature
                console.log('Signature is valid');
            } catch (e) {
                throw new Error('Signature could not be verified: ' + e);
            }

            // console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            // console.log(privateKeyDecrypted.users[0].userID);
            // console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            // console.log(publicKeyDecrypted);
            // console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        })();
    });

});


// it('creates ed25519 key pair with nodejs crypto module', async () => {
//
//     const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
//         // publicKeyEncoding: {
//         //     type: 'spki',
//         //     format: 'pem',
//         // },
//         // privateKeyEncoding: {
//         //     type: 'pkcs8',
//         //     format: 'pem',
//         //     // cipher: 'aes-256-cbc',
//         //     // passphrase: 'top secret'
//         // },
//     });
//
//     console.log(publicKey.type, privateKey.type);
//
//     const pubKeyExp = publicKey.export({
//         type: 'spki',
//         format: 'pem',
//     });
//
//     const privKeyExp = privateKey.export({
//         type: 'pkcs8',
//         format: 'pem',
//         // cipher: 'aes-256-cbc',
//         // passphrase: 'top secret'
//     });
//
//     console.log(pubKeyExp, privKeyExp);
//
//     var buf = Buffer.from('my secret message');
//
//     const encrypted = crypto.publicEncrypt(publicKey, buf);
//
//     console.log(encrypted);
//     console.log('Encrypted', encrypted.toString());
//
//     const decrypted = crypto.privateDecrypt(privateKey, encrypted);
//
//     console.log(decrypted);
//     console.log('Decrypted', decrypted.toString());
// });