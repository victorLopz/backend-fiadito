import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export class BusinessScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    request.businessId = request.user?.businessId ?? request.headers["x-business-id"]
    return next.handle()
  }
}
