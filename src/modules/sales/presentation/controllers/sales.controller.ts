import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common"
import { CreateSaleDto } from "src/modules/sales/application/dto/create-sale.dto"
import { ListSalesQueryDto } from "src/modules/sales/application/dto/list-sales-query.dto"
import { CreateSaleUseCase } from "src/modules/sales/application/use-cases/create-sale.use-case"
import { ListSalesUseCase } from "src/modules/sales/application/use-cases/list-sales.use-case"
import { BusinessId, CurrentUser } from "src/shared/common/decorators"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { AuthUser } from "src/shared/common/interfaces"
import { FindOneSaleUseCase } from "../../application/use-cases/find-one-sales.use-case"

@Controller("sales")
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
    private readonly findOneSaleUseCase: FindOneSaleUseCase
  ) {}

  @Post()
  create(
    @Body() dto: CreateSaleDto,
    @BusinessId() businessId: string,
    @CurrentUser() user?: AuthUser
  ) {
    return this.createSaleUseCase.execute(dto, businessId, user?.id ?? "system")
  }

  @Get()
  list(@BusinessId() businessId: string, @Query() query: ListSalesQueryDto) {
    return this.listSalesUseCase.execute(businessId, query)
  }

  @Get(":id")
  findOne(@BusinessId() businessId: string, @Query("id") saleId: string) {
    return this.findOneSaleUseCase.execute(businessId, saleId)
  }
}
