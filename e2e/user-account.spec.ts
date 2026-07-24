import { test, expect } from '@playwright/test'
import { loginAsUser } from './helpers/auth'

test.describe.serial('Authenticated User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('1. User dashboard loads after login', async ({ page }) => {
    await page.goto('/user')
    await page.waitForLoadState('networkidle')

    // Assert the dashboard page wrapper is visible
    await expect(page.getByTestId('user-dashboard-page')).toBeVisible()

    // Assert the sidebar is present
    await expect(page.getByTestId('user-sidebar')).toBeVisible()

    // Assert all main navigation links are rendered in the sidebar
    await expect(page.getByTestId('user-nav-profile')).toBeVisible()
    await expect(page.getByTestId('user-nav-orders')).toBeVisible()
    await expect(page.getByTestId('user-nav-favourites')).toBeVisible()
  })

  test('2. View and edit profile', async ({ page }) => {
    test.slow()
    await page.goto('/user')
    await page.waitForLoadState('networkidle')

    // Verify the profile form renders with user data
    await expect(page.getByTestId('profile-form')).toBeVisible()

    // Switch to edit mode
    await page.getByTestId('profile-edit-btn').click()

    // Edit the phone field (it has a placeholder of "Phone Number")
    const phoneInput = page.getByPlaceholder('Phone Number')
    await expect(phoneInput).toBeVisible()
    await phoneInput.fill('+44 7700 900000')

    // Save the changes
    await page.getByTestId('profile-save-btn').click()

    // Wait for save to complete — the edit button reappears when form
    // returns to read-only mode (toast notification may be used instead
    // of inline text, so we verify by state change instead)
    await page.waitForFunction(
      () => document.querySelector('[data-testid="profile-edit-btn"]') !== null,
      { timeout: 10000 },
    )
    await expect(page.locator('[data-testid="profile-edit-btn"]')).toBeVisible()

    // Verify the change persisted in the read-only display
    await expect(page.getByText(/7700/)).toBeVisible()
  })

  test('3. View orders', async ({ page }) => {
    await page.goto('/user/orders')
    await page.waitForLoadState('networkidle')

    // Expect the orders page to be visible (seed data includes 1 PAID order)
    await expect(page.getByTestId('user-orders-page')).toBeVisible()
    await expect(page.getByTestId('order-user-table')).toBeVisible()

    // Click the eye/view button on the first order row
    const viewButton = page.getByRole('button', { name: /view order/i }).first()
    await expect(viewButton).toBeVisible()
    await viewButton.click()

    // Wait for navigation to the order detail page
    await page.waitForURL(/\/user\/orders\//)
    await page.waitForLoadState('networkidle')

    // Verify the order detail page shows order information
    await expect(page.getByText(/order/i).first()).toBeVisible()
    await expect(
      page.getByText(/items summary|total|shipping address/i).first(),
    ).toBeVisible()
  })

  test('4. Favourites page', async ({ page }) => {
    await page.goto('/user/favourites')
    await page.waitForLoadState('networkidle')

    // Expect the favourites page to be visible
    await expect(page.getByTestId('favourites-page')).toBeVisible()

    // Seed data includes 1 favourite for "hand-thrown-stoneware-vase"
    await expect(page.getByTestId('favourites-grid')).toBeVisible()
    const productCard = page.getByTestId(
      'product-card-hand-thrown-stoneware-vase',
    )
    await expect(productCard).toBeVisible()

    // Click the product card — it links to /shop/<slug>
    await productCard.click()
    await expect(page).toHaveURL(/\/shop\/hand-thrown-stoneware-vase/)
  })

  test('5. Navigate user sidebar', async ({ page }) => {
    await page.goto('/user')
    await page.waitForLoadState('networkidle')

    // Click Orders nav link → expect URL to contain /user/orders
    await page.getByTestId('user-nav-orders').click()
    await expect(page).toHaveURL(/\/user\/orders/)
    await page.waitForLoadState('networkidle')

    // Click Favourites nav link → expect URL to contain /user/favourites
    await page.getByTestId('user-nav-favourites').click()
    await expect(page).toHaveURL(/\/user\/favourites/)
    await page.waitForLoadState('networkidle')

    // Click Profile nav link → expect URL to be /user
    await page.getByTestId('user-nav-profile').click()
    await expect(page).toHaveURL(/\/user\/?$/)
  })
})

test.describe('Logout', () => {
  test('6. Logout from user area and verify redirect', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/user')
    await page.waitForLoadState('networkidle')

    // Click the logout button in the sidebar
    await page.getByTestId('user-nav-logout').click()

    // Wait for redirect to the login page
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 })

    // Attempt to access a protected route — should redirect back to login
    await page.goto('/user')
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
  })
})
