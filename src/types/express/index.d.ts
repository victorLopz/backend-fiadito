import { AuthUser } from "src/shared/common/interfaces"

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      businessId?: string
    }
  }
}

export {}
