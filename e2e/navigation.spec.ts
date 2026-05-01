import { test, expect } from '@playwright/test'

test.describe('Navigation and Static Pages', () => {
  test('should load the Home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    // Adjust selector based on your actual content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should load the About page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
    // Expect some heading or text related to About
    await expect(page.getByText(/about/i).first()).toBeVisible()
  })

  test('should load the Contact page', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page).toHaveURL('/contacts')
    // Check for a contact form or contact text
    await expect(page.getByText(/contact/i).first()).toBeVisible()
  })

  test('should load the FAQ page', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).toHaveURL('/faq')
    // Check for FAQ title or questions
    await expect(
      page.getByText(/faq|frequently asked questions/i).first(),
    ).toBeVisible()
  })

  test('should load the Terms and Conditions page', async ({ page }) => {
    await page.goto('/terms')
    await expect(page).toHaveURL('/terms')
    await expect(page.getByText(/terms|conditions/i).first()).toBeVisible()
  })
})
