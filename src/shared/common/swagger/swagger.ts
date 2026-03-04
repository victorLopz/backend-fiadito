import { INestApplication, SetMetadata } from '@nestjs/common';

export const ApiTags = (...tags: string[]) => SetMetadata('api:tags', tags);
export const ApiOperation = (operation: { summary: string }) => SetMetadata('api:operation', operation);
export const ApiResponse = (response: { status: number; description: string }) => SetMetadata('api:response', response);
export const ApiBody = (body: Record<string, unknown>) => SetMetadata('api:body', body);
export const ApiParam = (param: Record<string, unknown>) => SetMetadata('api:param', param);
export const ApiProperty = (_options?: Record<string, unknown>): PropertyDecorator => () => undefined;
export const ApiPropertyOptional = (_options?: Record<string, unknown>): PropertyDecorator => () => undefined;
export const ApiBearerAuth = (): ClassDecorator & MethodDecorator => SetMetadata('api:bearer', true);

/**
 * Configura una ruta básica de documentación OpenAPI-like sin dependencia externa.
 * Expone `/docs` y `/docs/json`.
 */
export function setupSwagger(app: INestApplication): void {
  const document = {
    openapi: '3.0.0',
    info: {
      title: 'Fiadito API',
      version: '1.0.0',
      description: 'Documentación básica de endpoints de autenticación, ventas, deudas e inventario.',
    },
  };

  const adapter = app.getHttpAdapter();
  adapter.get('/docs/json', (_req: unknown, res: { json: (v: unknown) => void }) => res.json(document));
  adapter.get('/docs', (_req: unknown, res: { send: (v: string) => void }) =>
    res.send('<html><body><h1>Fiadito API Docs</h1><p>OpenAPI JSON: <a href="/docs/json">/docs/json</a></p></body></html>'),
  );
}
