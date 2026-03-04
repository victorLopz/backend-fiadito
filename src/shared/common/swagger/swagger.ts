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
    return {
      openapi: this.document.openapi,
      info: { ...this.document.info },
      components: this.document.components
        ? {
            securitySchemes: this.document.components.securitySchemes
              ? { ...this.document.components.securitySchemes }
              : undefined,
          }
        : undefined,
    };
  }
}

export class SwaggerModule {
  static createDocument(_app: INestApplication, config: SwaggerDoc): SwaggerDoc {
    return config;
  }

  static setup(path: string, app: INestApplication, document: SwaggerDoc, options?: { swaggerOptions?: { persistAuthorization?: boolean } }): void {
    const adapter = app.getHttpAdapter();
    const normalizedPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
    const basePath = `/${normalizedPath}`;
    const jsonPath = `${basePath}/json`;
    const persistAuth = Boolean(options?.swaggerOptions?.persistAuthorization);

    adapter.get(jsonPath, (_req: unknown, res: { json: (value: unknown) => void }) => {
      res.json(document);
    });

    adapter.get(basePath, (_req: unknown, res: { type: (value: string) => void; send: (value: string) => void }) => {
      res.type('text/html');
      res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${document.info.title} - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html, body { margin: 0; padding: 0; background: #fafafa; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '${jsonPath}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        persistAuthorization: ${persistAuth ? 'true' : 'false'}
      });
    };
  </script>
</body>
</html>`);
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
