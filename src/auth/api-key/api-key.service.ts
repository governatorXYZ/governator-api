import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthMongoService } from '../auth.mongo.service';
import Utils from '../../common/utils';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { UpdateResult } from 'mongodb';

@Injectable()
export class ApiKeyAuthService {

    private readonly logger = new Logger(ApiKeyAuthService.name);

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly authMongoService: AuthMongoService,
        private readonly configService: ConfigService,
    ) {
        // do nothing
    }

    async onApplicationBootstrap(): Promise<void> {
        this.cacheKeys();
    }

    async validateApiKey(apiKey: string): Promise<boolean> {
        let keyHashes = await this.cacheManager.get('api_keys') as string[];
        if (!keyHashes) await this.cacheKeys().then(cached => keyHashes = cached);
        if (await Utils.validateKeyAgainstHashArray(apiKey, keyHashes)) return true;
        return false;
    }

    async getApiKeys(): Promise<string[]> {
        try {
            return (await this.authMongoService.findOne()).api_key_hashes;
        } catch {
            return [];
        }
    }

    async cacheKeys(): Promise<string[]> {
        const keyHashes = await this.getApiKeys();
        // ttl in ms
        this.cacheManager.set('api_keys', keyHashes, 0);
        return this.cacheManager.get('api_keys');
    }

    async createApiKey(): Promise<string> {

        const apiKey = Buffer.from(uuidv4()).toString('base64');

        const crypt = await Utils.cryptApiKey(apiKey);

        let doc = await this.authMongoService.findOne();

        if (!doc) {
            doc = await this.authMongoService.create({ api_key_hashes: [crypt] });
            return apiKey;
        }

        const updateDoc = doc.api_key_hashes;

        if (await Utils.validateKeyAgainstHashArray(apiKey, updateDoc)) return;

        updateDoc.push(crypt);

        await this.authMongoService.updateOne({ _id: doc._id }, { api_key_hashes: updateDoc });

        this.cacheKeys();

        this.logger.log('API key created');

        return apiKey;
    }

    async deleteApiKey(apiKey: string): Promise<UpdateResult<Document> | null> {

        const doc = await this.authMongoService.findOne();

        const keyHashes = doc.api_key_hashes;

        const hash = await Utils.validateKeyAgainstHashArray(apiKey, keyHashes);

        if (!hash) return;

        const index = keyHashes.indexOf(hash);

        if (index > -1) {
            keyHashes.splice(index, 1);
        }

        return this.authMongoService.updateOne({ _id: doc._id }, { api_key_hashes: keyHashes });
    }

    validateApiAdminKey(apiKey: string): boolean {
        return (this.configService.get<string>('API_KEY') === apiKey);
    }
}