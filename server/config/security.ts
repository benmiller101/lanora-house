// Security configuration for LANORA HOUSE platform

export const SECURITY_CONFIG = {
  // Rate limiting settings
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per window
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 API requests per window
    },
    upload: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 20, // 20 uploads per window
    },
  },
  
  // File upload security
  upload: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilenameLength: 255,
  },
  
  // Session security
  session: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
  
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
  
  // Admin settings
  admin: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
  },
};

// Environment-specific security warnings
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 Production security mode enabled');
  
  // Validate critical security environment variables
  const requiredSecurityVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SESSION_SECRET'];
  const missingVars = requiredSecurityVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing security environment variables:', missingVars.join(', '));
  }
} else {
  console.log('🔧 Development security mode - using fallback credentials');
}