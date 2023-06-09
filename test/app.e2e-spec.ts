import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import jestOpenAPI from 'jest-openapi';
import { configure } from '../src/app.config';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { constants, dtos, mocks } from './mocks';

describe('e2e testing of governator server', () => {
    let app: INestApplication;
    let moduleFixture: TestingModule;
    let server: any;
    const API_KEY = process.env.API_KEY

    beforeAll(async () => {

        moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Configure the app as in production and setup OpenAPI testing
        jestOpenAPI(configure(app, true));

        await app.init();

        server = app.getHttpServer();
    });
      
    xdescribe('auth', () => {

        const publicEndpoints = [
            '/api/swagger-ui-init.js',
            '/api/api/swagger-ui-init.js',
            '/api',
            '/api/',
            '/api-json',
            '/api-yaml',
        ];

        const ouathEndpoints = [
            '/api/auth/login',
            '/api/auth/logout',
            '/api/auth/redirect',
        ];

        // TODO:
        // const discordOAuthEndpoints = [
        //     'auth/session',
        //     'auth/discord/servers',
        // ];

        it('should fail with 401 (unauthorized) if no authentication is provided', async () => {
    
            const router = server._events.request._router;
    
            const availableRoutes: Record<string, string>[] = router.stack
                .map(layer => {
                    if (layer.route) {
                        return {
                            path: layer.route?.path,
                            method: layer.route?.stack[0].method,
                        };
                    }
                })
                .filter(item => item !== undefined && !publicEndpoints.includes(item.path));
    
            const apiKeyRoutes = availableRoutes.filter(item => !ouathEndpoints.includes(item.path));
        
            for (const route of apiKeyRoutes) {
                if (route.method === 'get') {
                    await request(server)
                        .get(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
                
                if (route.method === 'post') {
                    await request(server)
                        .post(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'patch') {
                    await request(server)
                        .patch(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'delete') {
                    await request(server)
                        .delete(route.path)
                        .set('Accept', 'application/json')
                        .expect(HttpStatus.UNAUTHORIZED);
                }
            }
        });

        it('should fail with 401 (unauthorized) if incorrect authentication is provided', async () => {

            const key = 'wrong key';
    
            const router = server._events.request._router;
    
            const availableRoutes: Record<string, string>[] = router.stack
                .map(layer => {
                    if (layer.route) {
                        return {
                            path: layer.route?.path,
                            method: layer.route?.stack[0].method,
                        };
                    }
                })
                .filter(item => item !== undefined && !publicEndpoints.includes(item.path));
    
            const apiKeyRoutes = availableRoutes.filter(item => !ouathEndpoints.includes(item.path));
        
            for (const route of apiKeyRoutes) {
                if (route.method === 'get') {
                    await request(server)
                        .get(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
                
                if (route.method === 'post') {
                    await request(server)
                        .post(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'patch') {
                    await request(server)
                        .patch(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
    
                if (route.method === 'delete') {
                    await request(server)
                        .delete(route.path)
                        .set('Accept', 'application/json')
                        .set('X-API-KEY', key)
                        .expect(HttpStatus.UNAUTHORIZED);
                }
            }
        }, 50000);

        it('should pass with 200 (OK) if correct authentication is provided', async () => {
    
            await request(server)
                .get('/api/poll/list')
                .set('Accept', 'application/json')
                .set('X-API-KEY', API_KEY)
                .expect(HttpStatus.OK);
        });

        it('should pass with 302 (found) on oauth routes', async () => {
        
            for (const path of ouathEndpoints) {
                await request(server)
                    .get(path)
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.FOUND);
            }
        });
    });

    describe('vote', () => {

        it('should create a new vote', async () => {
        
            await request(server)
                    .get('/api/vote')
                    .set('Accept', 'application/json')
                    .expect(HttpStatus.FOUND);
        });

    }


    // xit('tests a valid vote request', async () => {

    //     // console.log(app.getUrl());

    //     await request(server)
    //         // .post(`/vote/${constants.pollId}`)
    //         .get('/api/user/list')
    //         .set('Accept', 'application/json')
    //         // .set('X-API-KEY', process.env.API_KEY)
    //         // .send(dtos.voteRequestDto)
    //         .expect(HttpStatus.OK);
    // });


    afterAll(async () => {
        await app.close();
    });
});
