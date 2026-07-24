import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Log in as the admin user via the login form UI.
 * Credentials: admin@curlypottery.com / admin123
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, 'admin@curlypottery.com', 'admin123')
}

/**
 * Log in as a regular user via the login form UI.
 * Credentials: user@test.com / password123
 */
export async function loginAsUser(page: Page): Promise<void> {
  await login(page, 'user@test.com', 'password123')
}

/**
 * Log in with provided credentials via the login form.
 * Navigates to /auth/login, fills the form, submits, and waits for redirect away from login.
 */
async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')

  // Fill login form — use data-testid to avoid matching the show-password toggle button
  const emailInput = page.getByTestId('login-email-input')
  const passwordInput = page.getByTestId('login-password-input')

  await emailInput.fill(email)
  await passwordInput.fill(password)

  // Submit
  const submitButton = page.locator('[data-testid="login-submit-btn"]')
  await submitButton.click()

  // Login uses client-side navigation (signIn + router.push), so no full
  // page load event fires.  Wait for the page URL to change away from /auth
  // by polling with waitForFunction.
  await page.waitForFunction(
    () => !window.location.pathname.startsWith('/auth'),
    { timeout: 15000 },
  )
}

/**
 * Log out the current user.
 * Assumes there's a logout button/trigger visible on the page.
 */
export async function logout(page: Page): Promise<void> {
  // Try clicking a logout link/button in the UI
  // This could be in user sidebar or nav dropdown
  const logoutButton = page
    .getByRole('button', { name: /log out|sign out/i })
    .first()
  const logoutLink = page
    .getByRole('link', { name: /log out|sign out/i })
    .first()

  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  } else if (await logoutLink.isVisible()) {
    await logoutLink.click()
  }

  // Wait for redirect to login page
  await page.waitForURL(/\/auth\/login/, { timeout: 10000 }).catch(() => {
    // Timeout is acceptable — user might already be logged out
  })
}

/**
 * Expect that the page shows an unauthenticated/guest state.
 */
export async function expectGuestState(page: Page): Promise<void> {
  // Should be on login page or see sign-in prompt
  await expect(
    page.getByRole('heading', { name: /sign in|log in/i }),
  ).toBeVisible()
}
