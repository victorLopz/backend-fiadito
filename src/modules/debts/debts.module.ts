import { Module } from "@nestjs/common"
import { DebtsService } from "./application/use-cases/debts.service"
import { DebtsController } from "./presentation/controllers/debts.controller"

@Module({
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService]
})
export class DebtsModule {}
