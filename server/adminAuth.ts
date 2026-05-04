// Simple admin authentication for the LANORA HOUSE platform

// Primary admin credentials from environment variables with secure fallbacks
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@lanorahouse.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@Kawasak16724020000";

// All valid admin email addresses (case-insensitive)
const VALID_ADMIN_EMAILS = [
  ADMIN_EMAIL.toLowerCase(),
  "mattapinch@gmail.com",
  "info@lanorahouse.com",
];

// Function to check if the provided credentials match any admin credentials
export function isAdminUser(email: string, password: string): boolean {
  if (!email || !password) {
    return false;
  }
  return (
    VALID_ADMIN_EMAILS.includes(email.toLowerCase().trim()) &&
    password === ADMIN_PASSWORD
  );
}

// Admin user object
export function getAdminUser() {
  return {
    id: "admin-001",
    email: ADMIN_EMAIL,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: new Date().toISOString()
  };
}
