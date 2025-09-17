interface DeviceInfo {
  deviceType: string
  browser: string
  os: string
  platform: string // 'web', 'mobile_app', 'desktop_app'
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType = 'desktop'
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone') ||
    ua.includes('phone') ||
    ua.includes('webview') ||
    ua.includes('okhttp') || // Android HTTP client
    ua.includes('reactnative') ||
    ua.includes('flutter') ||
    ua.includes('alamofire') // iOS HTTP client
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
  } else if (ua.includes('webview')) {
    browser = 'webview'
  } else if (ua.includes('okhttp')) {
    browser = 'okhttp'
  } else if (ua.includes('reactnative')) {
    browser = 'react-native'
  } else if (ua.includes('flutter')) {
    browser = 'flutter'
  } else if (ua.includes('alamofire')) {
    browser = 'alamofire'
  }

  // Detect OS - Fixed iOS detection
  let os = 'unknown'
  if (ua.includes('windows')) {
    os = 'windows'
  } else if (ua.includes('android')) {
    os = 'android'
  } else if (
    ua.includes('ios') ||
    ua.includes('iphone') ||
    ua.includes('ipad') ||
    ua.includes('cpu iphone os')
  ) {
    os = 'ios'
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macos'
  } else if (ua.includes('linux')) {
    os = 'linux'
  }

  // Detect platform (web vs app)
  let platform = 'web'
  if (
    ua.includes('okhttp') ||
    ua.includes('reactnative') ||
    ua.includes('flutter') ||
    ua.includes('alamofire')
  ) {
    platform = 'mobile_app'
  } else if (ua.includes('electron') || ua.includes('tauri')) {
    platform = 'desktop_app'
  }

  return {
    deviceType,
    browser,
    os,
    platform,
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

// Debug function to test User-Agent parsing
export function debugUserAgent(userAgent: string): {
  original: string
  parsed: DeviceInfo
  analysis: string
} {
  const parsed = parseUserAgent(userAgent)
  const ua = userAgent.toLowerCase()

  let analysis = 'Analysis:\n'
  analysis += `- Contains 'mobile': ${ua.includes('mobile')}\n`
  analysis += `- Contains 'android': ${ua.includes('android')}\n`
  analysis += `- Contains 'iphone': ${ua.includes('iphone')}\n`
  analysis += `- Contains 'cpu iphone os': ${ua.includes('cpu iphone os')}\n`
  analysis += `- Contains 'webview': ${ua.includes('webview')}\n`
  analysis += `- Contains 'okhttp': ${ua.includes('okhttp')}\n`
  analysis += `- Contains 'reactnative': ${ua.includes('reactnative')}\n`
  analysis += `- Contains 'flutter': ${ua.includes('flutter')}\n`
  analysis += `- Contains 'alamofire': ${ua.includes('alamofire')}\n`
  analysis += `- Contains 'electron': ${ua.includes('electron')}\n`
  analysis += `- Contains 'tauri': ${ua.includes('tauri')}\n`

  return {
    original: userAgent,
    parsed,
    analysis,
  }
}
