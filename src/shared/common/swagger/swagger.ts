import { INestApplication, SetMetadata } from '@nestjs/common';

type BearerConfig = {
  type: 'http';
  scheme: 'bearer';
  bearerFormat?: string;
  description?: string;
};

type SwaggerDoc = {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  components?: {
    securitySchemes?: Record<string, BearerConfig>;
  };
};

export class DocumentBuilder {
  private readonly document: SwaggerDoc = {
    openapi: '3.0.0',
    info: {
      title: '',
      description: '',
      version: '1.0.0',
    },
  };

  setTitle(title: string): this {
    this.document.info.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.document.info.description = description;
    return this;
  }

  setVersion(version: string): this {
    this.document.info.version = version;
    return this;
  }

  addBearerAuth(config?: BearerConfig, name = 'bearer'): this {
    const nextConfig: BearerConfig =
      config ??
      ({
        type: 'http',
        scheme: 'bearer',
      } as const);

    this.document.components = this.document.components ?? {};
    this.document.components.securitySchemes = this.document.components.securitySchemes ?? {};
    this.document.components.securitySchemes[name] = nextConfig;

    return this;
  }

  build(): SwaggerDoc {
    return { ...this.document };
  }
}

export class SwaggerModule {
  static createDocument(_app: INestApplication, config: SwaggerDoc): SwaggerDoc {
    return config;
  }

  static setup(path: string, app: INestApplication, document: SwaggerDoc, options?: { swaggerOptions?: { persistAuthorization?: boolean } }): void {
    const adapter = app.getHttpAdapter();

    adapter.get(`/${path}/json`, (_req: unknown, res: { json: (value: unknown) => void }) => {
      res.json(document);
    });

    adapter.get(`/${path}`, (_req: unknown, res: { send: (value: string) => void }) => {
      const persistAuth = Boolean(options?.swaggerOptions?.persistAuthorization);
      res.send(
        `<html><body><h1>${document.info.title}</h1><p>${document.info.description}</p><p>OpenAPI JSON: <a href="/${path}/json">/${path}/json</a></p><p>persistAuthorization: ${persistAuth}</p></body></html>`,
      );
    });
  }
}

export const ApiTags = (...tags: string[]) => SetMetadata('api:tags', tags);
export const ApiOperation = (operation: { summary: string }) => SetMetadata('api:operation', operation);
export const ApiResponse = (response: { status: number; description: string }) => SetMetadata('api:response', response);
export const ApiBody = (body: Record<string, unknown>) => SetMetadata('api:body', body);
export const ApiParam = (param: Record<string, unknown>) => SetMetadata('api:param', param);
export const ApiProperty = (_options?: Record<string, unknown>): PropertyDecorator => () => undefined;
export const ApiPropertyOptional = (_options?: Record<string, unknown>): PropertyDecorator => () => undefined;
export const ApiBearerAuth = (): ClassDecorator & MethodDecorator => SetMetadata('api:bearer', true);
