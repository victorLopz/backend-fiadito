import { AuditLogTypeOrmEntity } from "./audit-log.typeorm-entity"
import { AuthTokenTypeOrmEntity } from "./auth-token.typeorm-entity"
import { BusinessSubscriptionTypeOrmEntity } from "./business-subscription.typeorm-entity"
import { BusinessTypeOrmEntity } from "./business.typeorm-entity"
import { ClientTypeOrmEntity } from "./client.typeorm-entity"
import { CustomerTypeOrmEntity } from "./customers.typeorm-entity"
import { DebtPaymentTypeOrmEntity } from "./debt-payment.typeorm-entity"
import { DebtTypeOrmEntity } from "./debt.typeorm-entity"
import { InventoryMovementTypeOrmEntity } from "./inventory-movement.typeorm-entity"
import { MembershipPaymentTypeOrmEntity } from "./membership-payment.typeorm-entity"
import { OtpCodeTypeOrmEntity } from "./otp-code.typeorm-entity"
import { PlanTypeOrmEntity } from "./plan.typeorm-entity"
import { ProductTypeOrmEntity } from "./product.typeorm-entity"
import { ProductImageTypeOrmEntity } from "./product-image.typeorm-entity"
import { SaleItemTypeOrmEntity } from "./sale-item.typeorm-entity"
import { SaleTypeOrmEntity } from "./sale.typeorm-entity"
import { TrialTypeOrmEntity } from "./trial.typeorm-entity"
import { UserSessionTypeOrmEntity } from "./user-session.typeorm-entity"
import { UserTypeOrmEntity } from "./user.typeorm-entity"
import { VoucherTypeOrmEntity } from "./voucher.typeorm-entity"
import { WhatsappMessageLogTypeOrmEntity } from "./whatsapp-message-log.typeorm-entity"

export const TYPEORM_ENTITIES = [
  BusinessTypeOrmEntity,
  UserTypeOrmEntity,
  UserSessionTypeOrmEntity,
  AuthTokenTypeOrmEntity,
  OtpCodeTypeOrmEntity,
  PlanTypeOrmEntity,
  BusinessSubscriptionTypeOrmEntity,
  MembershipPaymentTypeOrmEntity,
  ProductTypeOrmEntity,
  ProductImageTypeOrmEntity,
  InventoryMovementTypeOrmEntity,
  ClientTypeOrmEntity,
  CustomerTypeOrmEntity,
  SaleTypeOrmEntity,
  SaleItemTypeOrmEntity,
  VoucherTypeOrmEntity,
  DebtTypeOrmEntity,
  DebtPaymentTypeOrmEntity,
  AuditLogTypeOrmEntity,
  WhatsappMessageLogTypeOrmEntity,
  TrialTypeOrmEntity
]
