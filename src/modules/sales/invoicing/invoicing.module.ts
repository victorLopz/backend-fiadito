import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CreateInvoiceUseCase } from "./application/use-cases/create-invoice.use-case"
import { INVOICE_REPOSITORY } from "./domain/repositories/invoice.repository"
import { InvoiceCreationDomainService } from "./domain/services/invoice-creation.domain-service"
import { InvoiceFactory } from "./domain/services/invoice.factory"
import { InvoiceItemTypeOrmEntity } from "./infrastructure/persistence/typeorm/invoice-item.typeorm-entity"
import { InvoiceTypeOrmEntity } from "./infrastructure/persistence/typeorm/invoice.typeorm-entity"
import { TypeOrmInvoiceRepository } from "./infrastructure/persistence/typeorm/typeorm-invoice.repository"
import { InvoicingController } from "./presentation/controllers/invoicing.controller"

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceTypeOrmEntity, InvoiceItemTypeOrmEntity])],
  controllers: [InvoicingController],
  providers: [
    CreateInvoiceUseCase,
    InvoiceFactory,
    InvoiceCreationDomainService,
    TypeOrmInvoiceRepository,
    {
      provide: INVOICE_REPOSITORY,
      useExisting: TypeOrmInvoiceRepository
    }
  ],
  exports: [CreateInvoiceUseCase]
})
export class InvoicingModule {}
