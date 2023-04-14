import { ConfigService } from '@nestjs/config';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OpenAPI } from 'openapi-types';
import helmet from 'helmet';

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
    // if (configService.get('NODE_ENV') === 'development') {
    //     app.enableCors();
    // } else if (configService.get('NODE_ENV') === 'production') {
    //     // app.enableCors({ origin: configService.get('CORS_ORIGIN').split(' ') });
    //     app.enableCors(configService.get('FE_HOST'));
    // }

    // Put a helmet on
    app.use(helmet());

    // specify cors and credentials for oauth session with FE
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', configService.get('FE_HOST'));
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

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
