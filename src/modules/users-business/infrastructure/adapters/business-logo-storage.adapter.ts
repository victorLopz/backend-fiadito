import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Client as BasicFtpClient } from "basic-ftp"
import SftpClient from "ssh2-sftp-client"
import { Readable } from "stream"

export interface UploadBusinessLogoInput {
  businessId: string
  fileName: string
  fileBuffer: Buffer
}

export interface UploadBusinessLogoResult {
  remotePath: string
  imageUrl: string
}

type StorageProtocol = "ftp" | "sftp"

@Injectable()
export class BusinessLogoStorageAdapter {
  private readonly host: string
  private readonly port: number
  private readonly user: string
  private readonly password: string
  private readonly secure: boolean
  private readonly protocol: StorageProtocol
  private readonly remoteBaseDir: string
  private readonly publicBaseUrl: string
  private readonly businessLogoDir: string

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.get<string>("FTP_HOST") ?? ""
    this.user = this.configService.get<string>("FTP_USER") ?? ""
    this.password = this.configService.get<string>("FTP_PASSWORD") ?? ""
    this.remoteBaseDir = this.trimSlashes(
      this.configService.get<string>("FTP_REMOTE_BASE_DIR") ?? ""
    )
    this.publicBaseUrl = (this.configService.get<string>("FTP_PUBLIC_BASE_URL") ?? "").replace(
      /\/+$/,
      ""
    )
    this.businessLogoDir = this.trimSlashes(
      this.configService.get<string>("BUSINESS_LOGO_DIR") ?? "negocios/logos"
    )

    const secureRaw = (this.configService.get<string>("FTP_SECURE") ?? "").trim().toLowerCase()
    this.protocol = secureRaw === "sftp" ? "sftp" : "ftp"
    this.secure = secureRaw === "true" || secureRaw === "1"
    this.port =
      Number(this.configService.get<string>("FTP_PORT")) || (this.protocol === "sftp" ? 22 : 21)
  }

  async uploadBusinessLogo(input: UploadBusinessLogoInput): Promise<UploadBusinessLogoResult> {
    this.assertConfig()

    const relativePath = `${this.businessLogoDir}/${input.businessId}/${input.fileName}`
    const remotePath = this.remoteBaseDir ? `${this.remoteBaseDir}/${relativePath}` : relativePath

    if (this.protocol === "sftp") {
      await this.uploadWithSftp(remotePath, input.fileBuffer)
    } else {
      await this.uploadWithFtp(remotePath, input.fileBuffer)
    }

    return {
      remotePath,
      imageUrl: `${this.publicBaseUrl}/${relativePath}`
    }
  }

  async deleteFile(remotePath: string): Promise<void> {
    if (!remotePath) {
      return
    }

    try {
      if (this.protocol === "sftp") {
        const client = new SftpClient()
        await client.connect({
          host: this.host,
          port: this.port,
          username: this.user,
          password: this.password
        })
        if (await client.exists(remotePath)) {
          await client.delete(remotePath)
        }
        await client.end()
        return
      }

      const client = new BasicFtpClient()
      await client.access({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        secure: this.secure
      })
      await client.remove(remotePath)
      client.close()
    } catch {
      return
    }
  }

  getRemotePathFromPublicUrl(url?: string | null): string | null {
    if (!url || !this.publicBaseUrl || !url.startsWith(`${this.publicBaseUrl}/`)) {
      return null
    }

    const relativePath = url.slice(this.publicBaseUrl.length + 1)
    if (!relativePath) {
      return null
    }

    return this.remoteBaseDir ? `${this.remoteBaseDir}/${relativePath}` : relativePath
  }

  private assertConfig(): void {
    if (!this.host || !this.user || !this.password || !this.publicBaseUrl) {
      throw new InternalServerErrorException("FTP configuration is incomplete")
    }

    if (!this.remoteBaseDir) {
      throw new InternalServerErrorException(
        "FTP_REMOTE_BASE_DIR is required and must map to a public web directory"
      )
    }
  }

  private async uploadWithFtp(remotePath: string, fileBuffer: Buffer): Promise<void> {
    const client = new BasicFtpClient()
    const remoteDirectory = this.dirname(remotePath)
    try {
      await client.access({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        secure: this.secure
      })
      await client.ensureDir(remoteDirectory)
      await client.uploadFrom(Readable.from(fileBuffer), this.basename(remotePath))
    } catch (error) {
      this.handleUploadError(error)
    } finally {
      client.close()
    }
  }

  private async uploadWithSftp(remotePath: string, fileBuffer: Buffer): Promise<void> {
    const client = new SftpClient()
    const remoteDirectory = this.dirname(remotePath)
    try {
      await client.connect({
        host: this.host,
        port: this.port,
        username: this.user,
        password: this.password
      })
      await client.mkdir(remoteDirectory, true)
      await client.put(fileBuffer, remotePath)
    } catch (error) {
      this.handleUploadError(error)
    } finally {
      await client.end()
    }
  }

  private handleUploadError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes("530") ||
      message.includes("Login authentication failed") ||
      message.includes("All configured authentication methods failed")
    ) {
      throw new BadRequestException("Invalid FTP credentials")
    }

    if (
      message.includes("ENOTFOUND") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT")
    ) {
      throw new ServiceUnavailableException("Could not connect to FTP server")
    }

    throw new InternalServerErrorException("Could not upload image file")
  }

  private trimSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, "")
  }

  private dirname(pathValue: string): string {
    const segments = pathValue.split("/")
    segments.pop()
    return segments.join("/")
  }

  private basename(pathValue: string): string {
    const segments = pathValue.split("/")
    return segments[segments.length - 1] ?? pathValue
  }
}
