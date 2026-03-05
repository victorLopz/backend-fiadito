import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { CreateCustomerDto } from "../../application/dto/create-customer.dto"
import { ListCustomersQueryDto } from "../../application/dto/list-customers-query.dto"
import { UpdateCustomerDto } from "../../application/dto/update-customer.dto"
import { CreateCustomerService } from "../../application/use-cases/create-customer.service"
import { GetCustomersService } from "../../application/use-cases/get-customers.service"
import { UpdateCustomerService } from "../../application/use-cases/update-customer.service"

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly updateCustomerService: UpdateCustomerService,
    private readonly getCustomersService: GetCustomersService
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.createCustomerService.execute(dto)
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateCustomerService.execute(id, dto)
  }

  @Get()
  list(@Query() query: ListCustomersQueryDto) {
    return this.getCustomersService.execute(query)
  }
}
