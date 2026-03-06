import { Controller, Get, Query } from "@nestjs/common"
import { BusinessId } from "src/shared/common/decorators"
import { ListCustomersSelectQueryDto } from "../../application/dto/list-customers-select-query.dto"
import { ListCustomersSelectService } from "../../application/use-cases/list-customers-select.service"

@Controller("clients")
export class ClientsController {
  constructor(private readonly listCustomersSelectService: ListCustomersSelectService) {}

  @Get("select")
  select(@BusinessId() businessId: string, @Query() query: ListCustomersSelectQueryDto) {
    return this.listCustomersSelectService.execute(businessId, query)
  }
}
