import { AccessLogRepository } from '@/repositories/access-log-repository'

interface CreateAccessLogUseCaseRequest {
  organizationId: string
  userAgent?: string
  ipAddress?: string
  deviceType?: string
  browser?: string
  os?: string
  location?: string
  platform?: string
}

interface CreateAccessLogUseCaseResponse {
  accessLog: {
    id: string
    created_at: Date
    updated_at: Date
    organizationId: string
    user_agent?: string | null
    ip_address?: string | null
    device_type?: string | null
    browser?: string | null
    os?: string | null
    location?: string | null
    platform?: string | null
  }
}

export class CreateAccessLogUseCase {
  constructor(private accessLogRepository: AccessLogRepository) {}

  async execute({
    organizationId,
    userAgent,
    ipAddress,
    deviceType,
    browser,
    os,
    location,
    platform,
  }: CreateAccessLogUseCaseRequest): Promise<CreateAccessLogUseCaseResponse> {
    const accessLog = await this.accessLogRepository.create({
      organization: {
        connect: {
          id: organizationId,
        },
      },
      user_agent: userAgent,
      ip_address: ipAddress,
      device_type: deviceType,
      browser,
      os,
      location,
      platform,
    })

    return {
      accessLog: {
        id: accessLog.id,
        created_at: accessLog.created_at,
        updated_at: accessLog.updated_at,
        organizationId: accessLog.organizationId,
        user_agent: accessLog.user_agent,
        ip_address: accessLog.ip_address,
        device_type: accessLog.device_type,
        browser: accessLog.browser,
        os: accessLog.os,
        location: accessLog.location,
        platform: accessLog.platform,
      },
    }
  }
}
