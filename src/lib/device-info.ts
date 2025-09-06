interface DeviceInfo {
  deviceType: string
  browser: string
  os: string
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType = 'desktop'
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    deviceType = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet'
  }

  // Detect browser
  let browser = 'unknown'
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'chrome'
  } else if (ua.includes('firefox')) {
    browser = 'firefox'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'safari'
  } else if (ua.includes('edg')) {
    browser = 'edge'
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'opera'
  }

  // Detect OS
  let os = 'unknown'
  if (ua.includes('windows')) {
    os = 'windows'
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macos'
  } else if (ua.includes('linux')) {
    os = 'linux'
  } else if (ua.includes('android')) {
    os = 'android'
  } else if (
    ua.includes('ios') ||
    ua.includes('iphone') ||
    ua.includes('ipad')
  ) {
    os = 'ios'
  }

  return {
    deviceType,
    browser,
    os,
  }
}

export function getClientIp(req: any): string | undefined {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip
  )
}
