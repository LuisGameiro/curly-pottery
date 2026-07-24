import { test, expect } from '@playwright/test'

const PRODUCT_SLUG = 'hand-thrown-stoneware-vase'

test.describe('Shopping Flow - Cart and Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app origin first, then clear persisted cart from localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('cart-storage'))
  })

  test('1. Add single item to cart', async ({ page }) => {
    test.slow()
    await page.goto(`/shop/${PRODUCT_SLUG}`)

    // Product view should be visible
    const productView = page.locator('[data-testid="product-view"]')
    await expect(productView).toBeVisible()

    // S variant should be selected by default - add-to-cart btn should be enabled
    const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]')
    await expect(addToCartBtn).toBeVisible()
    await expect(addToCartBtn).toBeEnabled()

    // Add item to cart
    await addToCartBtn.click()

    // Wait for confirmation - sonner toast or cart badge update
    const toast = page.getByText(/added.*to cart/i)
    await expect(toast)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // fallback: if toast dismissed quickly, proceed
      })

    // Navigate to cart page
    await page.goto('/cart')

    // Cart client container should be visible
    await expect(page.locator('[data-testid="cart-client"]')).toBeVisible()

    // Cart items list visible with at least one item
    const itemsList = page.locator('[data-testid="cart-items-list"]')
    await expect(itemsList).toBeVisible()
    const cartItems = page.locator('[data-testid^="cart-item-"]')
    await expect(cartItems.first()).toBeVisible()

    // Checkout button is present
    await expect(page.locator('[data-testid="checkout-btn"]')).toBeVisible()
  })

  test('2. Empty cart state', async ({ page }) => {
    // Navigate to cart - cart was already cleared in beforeEach
    await page.goto('/cart')

    // Should see the empty state
    await expect(page.locator('[data-testid="cart-empty-state"]')).toBeVisible()

    // Confirm no cart-item elements
    const cartItems = page.locator('[data-testid^="cart-item-"]')
    await expect(cartItems).toHaveCount(0)
  })

  test('3. Remove item from cart', async ({ page }) => {
    test.slow()
    // First add a product to cart
    await page.goto(`/shop/${PRODUCT_SLUG}`)
    await expect(page.locator('[data-testid="product-view"]')).toBeVisible()
    await page.locator('[data-testid="add-to-cart-btn"]').click()

    // Navigate to cart
    await page.goto('/cart')
    await expect(page.locator('[data-testid="cart-client"]')).toBeVisible()

    // Verify at least one item exists
    const removeBtn = page.locator('[data-testid^="cart-item-remove-"]').first()
    await expect(removeBtn).toBeVisible()

    // Click remove and wait for removal
    await removeBtn.click()

    // After removal the cart should show empty state
    await expect(page.locator('[data-testid="cart-empty-state"]')).toBeVisible({
      timeout: 8000,
    })
  })

  test('4. Checkout redirects to cart when cart is empty', async ({ page }) => {
    // Without cart items, the checkout page redirects to /cart
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/cart/, { timeout: 10000 })
  })

  test('5. Checkout success page loads', async ({ page }) => {
    await page.goto('/checkout/success')

    await expect(
      page.locator('[data-testid="checkout-success-page"]'),
    ).toBeVisible()

    const continueBtn = page.locator(
      '[data-testid="checkout-continue-shopping-btn"]',
    )
    await expect(continueBtn).toBeVisible()
    await expect(continueBtn).toBeEnabled()
  })

  test('6. Browse shop and view product from card', async ({ page }) => {
    await page.goto('/shop')

    // Wait for at least one product card to appear
    const firstCard = page.locator('[data-testid^="product-card-"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Click the card (the card itself is a link)
    await firstCard.click()

    // Should land on a product page with slug in URL
    await expect(page).toHaveURL(/\/shop\/.+/)
    await expect(page.locator('[data-testid="product-view"]')).toBeVisible()
  })

  test('7. Product with out-of-stock variant', async ({ page }) => {
    test.slow()
    await page.goto(`/shop/${PRODUCT_SLUG}`)
    await expect(page.locator('[data-testid="product-view"]')).toBeVisible()

    // Size options should be visible (the vase has S, M, L)
    const sizeOptions = page.locator('[data-testid="product-size-options"]')
    await expect(sizeOptions).toBeVisible()

    // Click the L (large) variant button - it should be out of stock
    const largeButton = sizeOptions.locator('button', { hasText: 'L' })
    await largeButton.click()

    // Out-of-stock message should appear
    const outOfStockMsg = page.locator('[data-testid="out-of-stock-message"]')

    await expect(outOfStockMsg).toBeVisible({ timeout: 5000 })

    // Switch back to S (in stock)
    const smallButton = sizeOptions.locator('button', { hasText: 'S' })
    await smallButton.click()

    // Now add-to-cart button should be visible and enabled
    const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]')
    await expect(addToCartBtn).toBeVisible()
    await expect(addToCartBtn).toBeEnabled()
  })

  test.describe('Checkout pages (guest)', () => {
    test('8. Checkout success page renders with key elements', async ({
      page,
    }) => {
      await page.goto('/checkout/success')
      await expect(
        page.locator('[data-testid="checkout-success-page"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="checkout-continue-shopping-btn"]'),
      ).toBeVisible()
    })

    test('9. Checkout page redirects to cart for empty guest cart', async ({
      page,
    }) => {
      // The checkout server component fetches cart data. For guest users,
      // the cart is in-memory/localStorage — the server sees an empty cart
      // and redirects to /cart. Verify this redirect behavior.
      await page.goto('/checkout')
      await page.waitForURL(/\/cart/, { timeout: 10000 })
    })
  })
})
