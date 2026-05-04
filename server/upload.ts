import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Express, Request, Response, NextFunction } from 'express';

// Make sure upload directories exist
const UPLOAD_DIR = path.join('public', 'uploads');
const PRODUCTS_DIR = path.join(UPLOAD_DIR, 'products');
const CATALOGS_DIR = path.join(UPLOAD_DIR, 'catalogs');
const CATALOG_ITEMS_DIR = path.join(UPLOAD_DIR, 'catalog-items');
const AUCTIONS_DIR = path.join(UPLOAD_DIR, 'auctions');
const PROFILES_DIR = path.join(UPLOAD_DIR, 'profiles');
const RAFFLES_DIR = path.join(UPLOAD_DIR, 'raffles');
const CATEGORIES_DIR = path.join(UPLOAD_DIR, 'categories');
const SUBMISSIONS_DIR = path.join(UPLOAD_DIR, 'submissions');
const CLEARANCE_DIR = path.join(UPLOAD_DIR, 'clearance');

// Create directories recursively if they don't exist
const directories = [
  UPLOAD_DIR,
  PRODUCTS_DIR,
  CATALOGS_DIR,
  CATALOG_ITEMS_DIR,
  AUCTIONS_DIR,
  PROFILES_DIR,
  RAFFLES_DIR,
  CATEGORIES_DIR,
  SUBMISSIONS_DIR,
  CLEARANCE_DIR
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination check - req.path:', req.path);
    
    // Determine upload directory based on the endpoint path
    if (req.path.includes('catalog-item-image')) {
      console.log('Using CATALOG_ITEMS_DIR:', CATALOG_ITEMS_DIR);
      cb(null, CATALOG_ITEMS_DIR);
    } else if (req.path.includes('catalog-image')) {
      console.log('Using CATALOGS_DIR:', CATALOGS_DIR);
      cb(null, CATALOGS_DIR);
    } else if (req.path.includes('auction-image')) {
      console.log('Using AUCTIONS_DIR:', AUCTIONS_DIR);
      cb(null, AUCTIONS_DIR);
    } else if (req.path.includes('profile-image')) {
      console.log('Using PROFILES_DIR:', PROFILES_DIR);
      cb(null, PROFILES_DIR);
    } else if (req.path.includes('raffle-image')) {
      console.log('Using RAFFLES_DIR:', RAFFLES_DIR);
      cb(null, RAFFLES_DIR);
    } else if (req.path.includes('category-image')) {
      console.log('Using CATEGORIES_DIR:', CATEGORIES_DIR);
      cb(null, CATEGORIES_DIR);
    } else if (req.path.includes('submissions')) {
      console.log('Using SUBMISSIONS_DIR:', SUBMISSIONS_DIR);
      cb(null, SUBMISSIONS_DIR);
    } else if (req.path.includes('clearance')) {
      console.log('Using CLEARANCE_DIR:', CLEARANCE_DIR);
      cb(null, CLEARANCE_DIR);
    } else {
      console.log('Using default PRODUCTS_DIR:', PRODUCTS_DIR);
      // Default to products directory
      cb(null, PRODUCTS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `image-${uniqueSuffix}${ext}`;
    console.log('Multer generating filename:', filename, 'for path:', req.path);
    cb(null, filename);
  }
});

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handler middleware for multer errors
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ message: err.message });
  }
  next();
};

// Create a special upload middleware for handling multiple images
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files at once
  }
});

export { upload };