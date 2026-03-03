import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BusinessId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.businessId ?? request.headers['x-business-id'];
});
