import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "../auth/auth.module"
import { CreateCustomerService } from "./application/use-cases/create-customer.service"
import { GetCustomersService } from "./application/use-cases/get-customers.service"
import { UpdateCustomerService } from "./application/use-cases/update-customer.service"
import { CUSTOMER_REPOSITORY } from "./domain/repositories/customer.repository"
import { CustomersTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { TypeOrmCustomerRepository } from "./infrastructure/persistence/repositories/typeorm-customer.repository"
import { CustomersController } from "./presentation/controllers/customers.controller"

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([CustomersTypeOrmEntity])],
  controllers: [CustomersController],
  providers: [
    CreateCustomerService,
    UpdateCustomerService,
    GetCustomersService,
    TypeOrmCustomerRepository,
    { provide: CUSTOMER_REPOSITORY, useExisting: TypeOrmCustomerRepository }
  ],
  exports: [CreateCustomerService, UpdateCustomerService, GetCustomersService]
})
export class CustomersModule {}
