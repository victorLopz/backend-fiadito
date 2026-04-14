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
