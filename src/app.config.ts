import { ConfigService } from '@nestjs/config';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OpenAPI } from 'openapi-types';

export const configure = (app, setupSwaggerModule = true): OpenAPI.Document => {
    // Makes .env available
    const configService = app.get(ConfigService);

    // // Get global prefix from .env
    const globalPrefix: string = configService.get('API_GLOBAL_PREFIX');

    // Versioning system
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Set global prefix
    app.setGlobalPrefix(globalPrefix);

    // Enable validation pipeline globally
    app.useGlobalPipes(new ValidationPipe());

    // TODO: this is for development only and has to be changed
    // set cors origin policy from .env
    app.enableCors({
        origin:
      configService.get('CORS_ORIGIN') === 'true' ||
      configService.get('CORS_ORIGIN') === 'false'
          ? configService.get('CORS_ORIGIN') === 'true'
          : configService.get('CORS_ORIGIN'),
    });

    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Governator API')
        .setDescription('REST API for Governator')
        .setVersion(configService.get('npm_package_version'))
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    if (setupSwaggerModule) SwaggerModule.setup(globalPrefix, app, document);

    // return openapi doc for e2e testing
    return document as OpenAPI.Document;
};
