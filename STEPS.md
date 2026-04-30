⚙️ Global / System Level
[ ] Fix Vercel Syncing Issue: Investigate why updates (new products/categories) from the admin panel are not reflecting on the live site. (Likely a caching or revalidation issue).
[ ] GDPR & Cookies: Review and improve the existing cookie consent pop-out.
[ ] Payment Options: Integrate payment options and ensure proper routing.
🏠 Header, Footer & Navigation
[ ] Header Redesign: Update to match the Figma design.
. Shop link bug: Can you describe exactly what happens? Does the link not navigate at all, navigate to the wrong page, or something else?
Search function implementation? Give suggestions from the website ? or should show products

[ ] Header Link Bug: Fix the "Shop" button in the header so it navigates correctly.
[ ] Search Bar: Add a search bar to the header specifically for finding products.
[ ] Favourites Feature: Create a "Favourites" page for logged-in users. Replace the "Logout" icon with a Heart icon in the header.
[ ] My Account Update: Move the "Logout" button inside the "My Account" page/dropdown.
[ ] Cart Icon Update: Change the cart icon counter to display the total number of items instead of the number of unique products.
[ ] Newsletter Banner: Add a "Be the first to know" subheader banner that triggers the newsletter sign-up pop-up.
📧 Pop-ups
[ ] Newsletter Sign-up: Build a pop-up with the provided text ("I am working on new pieces... Enter your email below and stay close").
[ ] Footer Update: Remove the curly pottery logo image and replace it with just the text/letters.
[ ] Footer Socials: Add the Instagram logo linking to the page, add the title "Follow Along on Instagram," and feature a picture of a recent post.
[ ] Footer Payments: Add payment provider logos (e.g., Klarna) to the footer.

🏡 Home Page
[ ] Hero Section: Add a "View Shop" introduction image that links directly to the shop.
[ ] New In Section: Add a section showcasing the 10 most recently added products.
[ ] Categories: Remove the "About" section and replace it with product categories.
[ ] UI Fix: Add text to the bottom of the photos to match the Figma design.
🛍️ Shop Page
[ ] Introduction: Add the "Welcome to My Shop" title and the provided description at the top of the page.
[ ] Product Display: Move the product names so they sit directly underneath the product images (refactor to match the provided examples).
[ ] Filter Update: Rename "Browse filter" to "Filter".
[ ] Sorting Options: Add "Availability (In Stock Only)" and an Alphabetical sort option.
[ ] Product Count: Display the total number of products (pulled from the database) on the right-hand side.
[ ] Phase 2 UI: Move "Filter By" and "Sort By" into dropdown buttons under the header on the left side.
🏺 Product Page
[ ] Image Layout: Center the product image.
[ ] Low Stock Warning: Add an "Only [X] left!" message below the title if the inventory is under 3.
[ ] Product Details: Update the description text to the provided custom copy ("Because each ceramic piece is individually hand-made...").
[ ] Care Instructions: Rename the title to "How to love your uniquely made pottery" and update the text.
[ ] Cleanup: Remove the "About Pottery" section.
[ ] Newsletter Integration: Update "Let’s stay connected" to include an email input and a "Sign Up" button.
[ ] Recommended Products: Replace the bottom carousel with a static "You Might Also Like" section showing items from the same category (or random items if none exist).
🛒 Cart & Checkout (Order Flow)
[ ] Cart Quantity Bug: Fix the bug where users can bypass the maximum quantity limit by adding the same item multiple times.
[ ] Stock Validation: Validate cart item quantities against the database to prevent overselling. (Explore creating a session to temporarily reserve products in the cart).
[ ] Checkout Bug (Info Page): Prevent users from continuing without entering an address. Add an error state.
[ ] Address Validation: Call an API to validate UK addresses.
[ ] Checkout Bug (Shipping Page): Fix the issue where the page gets stuck and delivery options cannot be selected.
[ ] Shipping UI Fix: Add a visual flag/highlight to clearly show which shipping option is currently selected.
[ ] Shipping Navigation: Add a "Continue to Payment" button.
[ ] Checkout Bug (Payment Page): Fix the routing/blocker that prevents users from reaching the Payment page.
[ ] Billing Address: Add a Billing Address option to the payment form (default to "Same as delivery address," with an option to change it).
⚙️ Admin / Database
[ ] Sync/Cache Bug: Investigate and fix the critical bug where categories and product names changed in the admin panel are not updating on the frontend (carousel, shop page, cart).

2. GDPR Cookie Consent
   The existing banner needs improvement. Would you like me to:

- Add persistent cookie consent (vs localStorage)
- Add "Manage Preferences" in footer
- Block analytics until consent granted?

3. Replace Domain Placeholder
   Update config/seo_meta.json:
   "url": "https://your-actual-domain.com"
