// Utility functions for handling login redirects

/**
 * Store the current page path for redirect after login
 * @param customPath - Optional custom path to store instead of current location
 */
export function storeLoginRedirect(customPath?: string) {
  const redirectPath = customPath || window.location.pathname;
  localStorage.setItem('loginRedirect', redirectPath);
}

/**
 * Get the stored redirect path and clear it from storage
 * @returns The stored redirect path or '/' as fallback
 */
export function getAndClearLoginRedirect(): string {
  const storedRedirect = localStorage.getItem('loginRedirect');
  localStorage.removeItem('loginRedirect');
  return storedRedirect || '/';
}

/**
 * Redirect to login page with current page stored for redirect
 * @param customRedirectPath - Optional custom path to redirect to after login
 */
export function redirectToLogin(customRedirectPath?: string) {
  storeLoginRedirect(customRedirectPath);
  window.location.href = '/login';
}

/**
 * Open login modal with current page stored for redirect
 * @param openModalFn - Function to open the login modal
 * @param customRedirectPath - Optional custom path to redirect to after login
 */
export function openLoginModal(openModalFn: () => void, customRedirectPath?: string) {
  storeLoginRedirect(customRedirectPath);
  openModalFn();
}