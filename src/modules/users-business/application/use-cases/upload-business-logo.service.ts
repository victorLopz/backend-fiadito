import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { randomUUID } from "crypto"
import { BusinessOutput } from "../../domain/dto/business.output"
import {
  BUSINESS_PROFILE_REPOSITORY,
  BusinessProfileRepository
} from "../../domain/repositories/business-profile.repository"
import { BusinessLogoStorageAdapter } from "../../infrastructure/adapters/business-logo-storage.adapter"

export interface UploadedLogoFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

@Injectable()
export class UploadBusinessLogoService {
  private readonly allowedMimeTypes = new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
  ])
  private readonly maxFileSizeBytes: number

  constructor(
    @Inject(BUSINESS_PROFILE_REPOSITORY)
    private readonly businessProfileRepository: BusinessProfileRepository,
    private readonly businessLogoStorageAdapter: BusinessLogoStorageAdapter,
    private readonly configService: ConfigService
  ) {
    const maxMb = Number(this.configService.get<string>("BUSINESS_LOGO_MAX_SIZE_MB") ?? 2)
    this.maxFileSizeBytes = Number.isFinite(maxMb) && maxMb > 0 ? maxMb * 1024 * 1024 : 2097152
  }

  async execute(businessId: string, file?: UploadedLogoFile): Promise<BusinessOutput> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    this.validateUploadedLogoFile(file)
    const logoFile = file

    const business = await this.businessProfileRepository.findById(businessId)
    if (!business) {
      throw new NotFoundException("Business not found")
    }

    const extension = this.allowedMimeTypes.get(logoFile.mimetype)!
    const fileName = `${randomUUID()}.${extension}`

    const upload = await this.businessLogoStorageAdapter.uploadBusinessLogo({
      businessId,
      fileName,
      fileBuffer: logoFile.buffer
    })

    try {
      await this.businessProfileRepository.update(businessId, { logoUrl: upload.imageUrl })
    } catch (error) {
      await this.businessLogoStorageAdapter.deleteFile(upload.remotePath)
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("uploaded file rollback executed after DB error", {
        cause: error
      })
    }

    const previousRemotePath = this.businessLogoStorageAdapter.getRemotePathFromPublicUrl(
      business.logoUrl
    )
    if (previousRemotePath && previousRemotePath !== upload.remotePath) {
      await this.businessLogoStorageAdapter.deleteFile(previousRemotePath)
    }

    const updatedBusiness = await this.businessProfileRepository.findById(businessId)
    if (!updatedBusiness) {
      throw new NotFoundException("Business not found")
    }

    return {
      id: updatedBusiness.id,
      legalName: updatedBusiness.legalName,
      logoUrl: updatedBusiness.logoUrl,
      currencyCode: updatedBusiness.currencyCode,
      countryCode: updatedBusiness.countryCode,
      timezone: updatedBusiness.timezone,
      receiptPrefix: updatedBusiness.receiptPrefix,
      receiptNextNumber: updatedBusiness.receiptNextNumber,
      isActive: updatedBusiness.isActive,
      createdAt: updatedBusiness.createdAt,
      updatedAt: updatedBusiness.updatedAt
    }
  }

  private validateUploadedLogoFile(file?: UploadedLogoFile): asserts file is UploadedLogoFile {
    if (!file) {
      throw new BadRequestException("logo file is required")
    }

    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException("logo file is empty")
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `logo file exceeds maximum size of ${this.maxFileSizeBytes} bytes`
      )
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException("only .jpg, .jpeg, .png and .webp are allowed")
    }
  }
}
