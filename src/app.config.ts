import { ConfigService } from '@nestjs/config';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OpenAPI } from 'openapi-types';
import helmet from 'helmet';
import { Reflector } from '@nestjs/core';
import { ApiKeyAuthGuard } from './auth/api-key.guard';
import session from 'express-session';
import passport from 'passport';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';

export const configure = (app, setupSwaggerModule = true): OpenAPI.Document => {

    // Makes .env available
    const configService = app.get(ConfigService);

    // Get global prefix from .env
    const globalPrefix: string = configService.get('API_GLOBAL_PREFIX');

    // Versioning system
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Set global prefix
    app.setGlobalPrefix(globalPrefix);

    // Enable validation pipeline globally
    // set { transform: true } to enable default values in dtos
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        enableDebugMessages: true,
    }));

    // set cors origin policy from .env
    if (configService.get('NODE_ENV') === 'development') {
        app.enableCors();
    } else if (configService.get('NODE_ENV') === 'production') {
        app.enableCors({ origin: configService.get('CORS_ORIGIN').split(' ') });
    }

    // Put a helmet on
    app.use(helmet());

    // Configure session
    const redisClient = new Redis({ port: 6379, host: 'localhost' });
    // redisClient.connect().catch(console.error)
    const RedisStore = connectRedis(session);

   
    app.use(session({
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({ client: redisClient }),
    }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // use global auth guard
    // const reflector = app.get(Reflector);
    // app.useGlobalGuards(new AuthGuard(reflector));

    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Governator API')
        .setDescription('REST API for Governator')
        .setVersion(configService.get('npm_package_version'))
        .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'api_key')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    if (setupSwaggerModule) SwaggerModule.setup(globalPrefix, app, document);

    // return openapi doc for e2e testing
    return document as OpenAPI.Document;
};
