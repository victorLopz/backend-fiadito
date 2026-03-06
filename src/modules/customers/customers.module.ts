import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "../auth/auth.module"
import { CreateCustomerService } from "./application/use-cases/create-customer.service"
import { GetCustomersService } from "./application/use-cases/get-customers.service"
import { ListCustomersSelectService } from "./application/use-cases/list-customers-select.service"
import { UpdateCustomerService } from "./application/use-cases/update-customer.service"
import { CUSTOMER_REPOSITORY } from "./domain/repositories/customer.repository"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { TypeOrmCustomerRepository } from "./infrastructure/persistence/repositories/typeorm-customer.repository"
import { ClientsController } from "./presentation/controllers/clients.controller"
import { CustomersController } from "./presentation/controllers/customers.controller"

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([CustomerTypeOrmEntity])],
  controllers: [CustomersController, ClientsController],
  providers: [
    CreateCustomerService,
    UpdateCustomerService,
    GetCustomersService,
    ListCustomersSelectService,
    TypeOrmCustomerRepository,
    { provide: CUSTOMER_REPOSITORY, useExisting: TypeOrmCustomerRepository }
  ],
  exports: [
    CreateCustomerService,
    UpdateCustomerService,
    GetCustomersService,
    ListCustomersSelectService
  ]
})
export class CustomersModule {}
