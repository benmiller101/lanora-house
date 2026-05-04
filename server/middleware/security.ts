import { Request, Response, NextFunction } from 'express';

// Simple rate limiting implementation
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 60 * 60 * 1000);

function createRateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    if (rateLimitStore[key].count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }
    
    rateLimitStore[key].count++;
    next();
  };
}

// Rate limiting for login attempts
export const loginRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes

// Rate limiting for API endpoints
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Rate limiting for file uploads
export const uploadRateLimit = createRateLimit(15 * 60 * 1000, 20); // 20 uploads per 15 minutes

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  
  next();
};

// File upload security validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Check file type
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    });
  }

  // Check file size
  if (req.file.size > maxFileSize) {
    return res.status(400).json({
      error: 'File too large. Maximum size is 10MB.'
    });
  }

  // Sanitize filename
  if (req.file.originalname) {
    req.file.originalname = req.file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 255);
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

// User authentication middleware - checks if user is logged in
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  
  if (session && session.user && session.user.id) {
    // Attach user to request object
    (req as any).user = session.user;
    return next();
  }
  
  return res.status(401).json({
    error: 'Authentication required'
  });
};

// Admin authentication middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  
  // Check session-based admin authentication first
  if (session && session.user && session.user.role === 'admin') {
    return next();
  }
  
  // Check x-admin-email / x-admin-password headers (used by admin frontend)
  const headerEmail = req.headers['x-admin-email'] as string | undefined;
  const headerPassword = req.headers['x-admin-password'] as string | undefined;
  if (headerEmail && headerPassword) {
    const validEmails = ['info@lanorahouse.com', 'mattapinch@gmail.com'];
    if (validEmails.includes(headerEmail.toLowerCase()) && headerPassword === '@Kawasak16724020000') {
      return next();
    }
  }

  // Check Basic authentication header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');
      
      // Check admin credentials  
      if (email === 'info@lanorahouse.com' && password === '@Kawasak16724020000') {
        return next();
      }
    } catch (error) {
      // Invalid base64 or malformed credentials
    }
  }
  return res.status(401).json({
    error: 'Admin access required'
  });
};

// CSRF protection for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF protection for auth, wishlist, clearance quotes, clearance stories, admin blog endpoints, and admin team endpoints
  if (req.path.startsWith('/api/wishlist') || 
      req.path.startsWith('/api/auth/') ||
      req.path.startsWith('/api/clearance-quotes') ||
      req.path.startsWith('/api/clearance-stories') ||
      req.path.startsWith('/api/admin/blog/') ||
      req.path.startsWith('/api/admin/team-members')) {
    return next();
  }
  
  // For now, just check that requests come from the same origin
  const origin = req.get('Origin');
  const host = req.get('Host');
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (!origin || !host || !origin.includes(host)) {
      return res.status(403).json({
        error: 'Invalid request origin'
      });
    }
  }
  
  next();
};