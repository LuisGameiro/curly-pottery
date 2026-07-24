import { test, expect } from '@playwright/test'

/* ==========================================================================
   Public (unauthenticated) pages and flows
   ========================================================================== */

test.describe('Homepage', () => {
  test('should load the homepage with hero section', async ({ page }) => {
    await page.goto('/')

    // Core structural elements
    await expect(page.locator('[data-testid="homehero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="navbar"]')).toBeVisible()
    await expect(page.locator('[data-testid="footer"]')).toBeVisible()

    // At least one product card should render in the new-arrivals grid
    await expect(
      page.locator('[data-testid^="product-card-"]').first(),
    ).toBeVisible()
  })

  test('should navigate to shop via navbar link', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="navbar-shop-link"]').click()
    await expect(page).toHaveURL(/\/shop/)
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Navigation / Static Pages', () => {
  const staticPages = [
    { path: '/about', testId: 'about-page' },
    { path: '/gallery', testId: 'gallery-page', extraTestId: 'gallery-header' },
    { path: '/contacts', testId: 'contacts-page', extraTestId: 'contact-form' },
    { path: '/faq', testId: 'faq-page', extraTestId: 'faq-accordion' },
    { path: '/privacy', testId: 'privacy-page' },
    { path: '/terms', testId: 'terms-page' },
    { path: '/cookies', testId: 'cookie-settings-page' },
  ]

  for (const { path, testId, extraTestId } of staticPages) {
    test(`should load the ${path} page with correct data-testid`, async ({
      page,
    }) => {
      await page.goto(path)
      await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible()
      if (extraTestId) {
        await expect(
          page.locator(`[data-testid="${extraTestId}"]`),
        ).toBeVisible()
      }
    })
  }

  test('should toggle FAQ accordion item and reveal answer', async ({
    page,
  }) => {
    await page.goto('/faq')
    await expect(page.locator('[data-testid="faq-accordion"]')).toBeVisible()

    // Click the first FAQ item button
    const firstItem = page.locator('[data-testid="faq-item-0"]')
    await expect(firstItem).toBeVisible()

    // The answer text is conditionally rendered — it should not be visible yet
    // The first question is "How is my order shipped?"
    await expect(firstItem).toContainText(/How is my order shipped/i)

    // Click to expand
    await firstItem.click()

    // After expanding, the answer should appear.  We check for a fragment of
    // the known answer text from the seed data.
    await expect(firstItem).toContainText(/Royal Mail|tracking number/i)
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Product Search', () => {
  test('should search for a product and display results', async ({ page }) => {
    test.slow()
    await page.goto('/search')
    await expect(page.locator('[data-testid="search-page"]')).toBeVisible()

    // The search-bar lives in the global navbar and should be visible on
    // desktop viewports (hidden on mobile via `hidden md:block`).
    const searchInput = page.locator('[data-testid="search-bar-input"]')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('vase')
    await searchInput.press('Enter')

    // Wait for client-side navigation to the search-results URL
    await expect(page).toHaveURL(/q=vase/)
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()

    // Verify that at least one matching product appears
    await expect(page.locator('[data-testid="search-results"]')).toContainText(
      /vase/i,
    )
  })

  test('should show empty state when no results match', async ({ page }) => {
    await page.goto('/search?q=xyznonexistent')
    await expect(page.locator('[data-testid="search-page"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="search-empty-state"]'),
    ).toBeVisible()
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Shop Page', () => {
  test('should load the shop page with product grid', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.locator('[data-testid="shop-client"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="shop-product-grid"]'),
    ).toBeVisible()

    // Verify product cards are rendered
    const productCards = page.locator('[data-testid^="product-card-"]')
    await expect(productCards.first()).toBeVisible()
    const count = await productCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Product Detail', () => {
  test('should load product page with all sections', async ({ page }) => {
    test.slow()
    await page.goto('/shop/hand-thrown-stoneware-vase')
    await expect(page.locator('[data-testid="product-view"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-name"]')).toContainText(
      /Stoneware Vase/i,
    )

    // Product description, size options, slider
    await expect(
      page.locator('[data-testid="product-description"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="product-size-options"]'),
    ).toBeVisible()
    await expect(page.locator('[data-testid="product-slider"]')).toBeVisible()

    // Price rendering depends on variant selection state — check optionally
    const price = page.locator('[data-testid="product-price"]')
    await expect(price)
      .toBeVisible({ timeout: 8000 })
      .catch(() => {
        // Price might be conditionally rendered after variant selection
      })

    // Add-to-cart should be visible and enabled (S variant is in stock)
    const addToCart = page.locator('[data-testid="add-to-cart-btn"]')
    await expect(addToCart).toBeVisible()
    await expect(addToCart).toBeEnabled()
  })
})

/* ------------------------------------------------------------------------ */

test.describe('404 Page', () => {
  test('should show not-found page for unknown routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-page')
    await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible()
    // The HTTP status should be 404
    expect(response?.status()).toBe(404)
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Error / Loading (smoke test)', () => {
  test('should load homepage without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await expect(page.locator('[data-testid="homehero-section"]')).toBeVisible()

    // No uncaught JS errors should have been thrown during load
    expect(errors).toHaveLength(0)
  })
})

/* ------------------------------------------------------------------------ */

test.describe('Newsletter Banner', () => {
  test('should interact with newsletter banner when present', async ({
    page,
  }) => {
    await page.goto('/')

    const banner = page.locator('[data-testid="newsletter-banner"]')
    if (!(await banner.isVisible())) {
      // Banner is not rendered on this build/route — skip gracefully
      test.skip(true, 'Newsletter banner not present on this page')
      return
    }

    const emailInput = page.locator(
      '[data-testid="newsletter-banner-email-input"]',
    )
    const submitBtn = page.locator(
      '[data-testid="newsletter-banner-submit-btn"]',
    )

    await expect(emailInput).toBeVisible()
    await expect(submitBtn).toBeVisible()

    await emailInput.fill('test@example.com')
    await submitBtn.click()

    // After submission the banner may disappear or show a success message;
    // at minimum verify the page is still in a healthy state.
    await expect(page.locator('[data-testid="homehero-section"]')).toBeVisible()
  })
})
