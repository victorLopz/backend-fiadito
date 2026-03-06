import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common"
import { BusinessId } from "src/shared/common/decorators"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { CreateCustomerDto } from "../../application/dto/create-customer.dto"
import { ListCustomersQueryDto } from "../../application/dto/list-customers-query.dto"
import { UpdateCustomerDto } from "../../application/dto/update-customer.dto"
import { CreateCustomerService } from "../../application/use-cases/create-customer.service"
import { GetCustomersService } from "../../application/use-cases/get-customers.service"
import { UpdateCustomerService } from "../../application/use-cases/update-customer.service"
import { ListCustomersSelectService } from "../../application/use-cases/list-customers-select.service"

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly updateCustomerService: UpdateCustomerService,
    private readonly getCustomersService: GetCustomersService,
    private readonly listCustomersSelectService: ListCustomersSelectService
  ) {}

  @Post()
  create(@Body() dto: CreateCustomerDto, @BusinessId() businessId: string) {
    return this.createCustomerService.execute(dto, businessId)
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @BusinessId() businessId: string
  ) {
    return this.updateCustomerService.execute(id, businessId, dto)
  }

  @Get()
  list(@BusinessId() businessId: string, @Query() query: ListCustomersQueryDto) {
    return this.getCustomersService.execute(businessId, query)
  }

  @Get("select")
  select(@BusinessId() businessId: string, @Query() query: ListCustomersQueryDto) {
    return this.listCustomersSelectService.execute(businessId, query)
  }
}
