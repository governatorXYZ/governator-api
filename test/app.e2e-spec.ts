import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import jestOpenAPI from 'jest-openapi';
import { configure } from '../src/app.config';
import * as fs from 'fs';


describe('e2e testing of governator server', () => {
    let app: INestApplication;

    beforeEach(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Configure the app as in production and setup OpenAPI testing
        jestOpenAPI(configure(app, false));

        await app.init();
    });


    it('Will create openapi specification', (done) => {
        const doc = configure(app, true);
        const outPath = 'governator-api-spec.json';
        fs.writeFile(outPath, JSON.stringify(doc), (error) => {
            if (error) throw error;
            else done();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
