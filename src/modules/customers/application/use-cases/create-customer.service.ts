import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { CreateCustomerDto } from "../dto/create-customer.dto"
import { CustomerOutput } from "../../domain/dto/customer.output"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "../../domain/repositories/customer.repository"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"

@Injectable()
export class CreateCustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly membershipService: MembershipService
  ) {}

  async execute(dto: CreateCustomerDto, businessId: string): Promise<CustomerOutput> {
    await this.assertCustomerLimitAllowsCreate(businessId)

    const customer = await this.customerRepository.create({
      businessId,
      name: dto.name,
      whatsappE164: dto.whatsappE164,
      notes: dto.notes,
      isActive: true
    })

    return {
      id: customer.id,
      name: customer.name,
      whatsappE164: customer.whatsappE164,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  }

  private async assertCustomerLimitAllowsCreate(businessId: string): Promise<void> {
    const membership = await this.membershipService.getStatus(businessId)
    if (!membership.allowed) {
      throw new BadRequestException("Business membership is not active")
    }

    const customerLimit = membership.subscription?.plan?.customerLimit
    if (customerLimit === undefined || customerLimit === null || customerLimit < 0) {
      return
    }

    const activeCustomers = await this.customerRepository.countActiveByBusiness(businessId)
    if (activeCustomers >= customerLimit) {
      throw new BadRequestException("Membership customer limit reached")
    }
  }
}
