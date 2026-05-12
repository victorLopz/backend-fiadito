export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  CASHIER = "CASHIER"
}

export enum SaleType {
  CASH = "CASH",
  CREDIT = "CREDIT"
}

export enum DebtStatus {
  OPEN = "OPEN",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export enum TokenType {
  REFRESH = "REFRESH",
  RESET_PASSWORD = "RESET_PASSWORD"
}

export enum OtpPurpose {
  LOGIN = "LOGIN",
  PASSWORD_RESET = "PASSWORD_RESET",
  PHONE_VERIFICATION = "PHONE_VERIFICATION"
}

export enum InventoryMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT"
}

export enum WhatsappMessageType {
  DEBT_REMINDER = "DEBT_REMINDER",
  PAYMENT_REMINDER = "PAYMENT_REMINDER",
  PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION",
  SALE_RECEIPT = "SALE_RECEIPT",
  CUSTOM = "CUSTOM"
}

export enum MembershipPlanCode {
  FREE = "FREE",
  LITE = "LITE",
  PRO = "PRO"
}

export enum MembershipSubscriptionStatus {
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}

export enum MembershipPaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum MembershipPaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CARD = "CARD",
  MANUAL = "MANUAL",
  OTHER = "OTHER"
}
