# Curly Pottery Modernization: Progress Tracker

## ✅ Completed Tasks (Backend, Security & Optimization)

**Global & Admin:**

- [x] **Sync/Cache Bug (Vercel Syncing):** Investigated and fixed the bug where admin updates to products/categories were not syncing to the frontend. Triggered global cache revalidation across layouts.
- [x] **Replace Domain Placeholder:** Configured `config/seo_meta.json` and `SEO.tsx` to pull the base URL dynamically from environment variables, fixing SEO mapping.

**Cart & Checkout (Security):**

- [x] **Payment Options:** SumUp and Klarna have been successfully integrated and routed.
- [x] **Cart Quantity Bug:** Fixed. The system now cross-references `Math.min(item.quantity, variant.stock)` on the server to prevent quantity limits from being bypassed by UI glitches.
- [x] **Stock Validation:** Enforced true server-side validation. Cart quantities are actively checked against the database upon sync and order creation.
- [x] **Price Spoofing (Critical):** Fixed vulnerability where clients could manipulate `totalPrice` in the Klarna/SumUp API routes.
- [x] **IDOR & Unauthorized Deletions (Critical):** Fully secured User profiles and Image deletions with strict `session.user.id` and `ADMIN` role checks.

---

## 🔄 Pending Tasks (Organized By Screen)

### ⚙️ Global & System Level

- [x] **GDPR & Cookies:** Improve existing cookie consent pop-out (Add persistent cookies, "Manage Preferences", and block analytics until granted).

### 🏠 Header, Footer & Navigation

- [ ] **Header Redesign:** Update to match the Figma design.
- [ ] **Header Link Bug:** Fix the "Shop" button in the header so it navigates correctly.
- [ ] **Search Bar:** Add a search bar to the header specifically for finding products.
- [ ] **Favourites Feature:** Create a "Favourites" page for logged-in users. Replace the "Logout" icon with a Heart icon in the header.
- [ ] **My Account Update:** Move the "Logout" button inside the "My Account" page/dropdown.
- [ ] **Cart Icon Update:** Change the cart icon counter to display the total number of items instead of the number of unique products.
- [ ] **Newsletter Banner:** Add a "Be the first to know" subheader banner that triggers the newsletter sign-up pop-up.
- [ ] **Footer Update:** Remove the curly pottery logo image and replace it with just the text/letters.
- [ ] **Footer Socials:** Add the Instagram logo linking to the page, add the title "Follow Along on Instagram," and feature a picture of a recent post.
- [ ] **Footer Payments:** Add payment provider logos (e.g., Klarna) to the footer.

### 📧 Pop-ups

- [ ] **Newsletter Sign-up:** Build a pop-up with the provided text ("I am working on new pieces... Enter your email below and stay close").

### 🏡 Home Page

- [ ] **Hero Section:** Add a "View Shop" introduction image that links directly to the shop.
- [ ] **New In Section:** Add a section showcasing the 10 most recently added products.
- [ ] **Categories:** Remove the "About" section and replace it with product categories.
- [ ] **UI Fix:** Add text to the bottom of the photos to match the Figma design.

### 🛍️ Shop Page

- [x] **Introduction:** Add the "Welcome to My Shop" title and the provided description at the top of the page.
- [x] **Product Display:** Move the product names so they sit directly underneath the product images (refactor to match the provided examples).
- [x] **Filter Update:** Rename "Browse filter" to "Filter".
- [x] **Sorting Options:** Add "Availability (In Stock Only)" and an Alphabetical sort option.
- [x] **Product Count:** Display the total number of products (pulled from the database) on the right-hand side.
- [ ] **Phase 2 UI:** Move "Filter By" and "Sort By" into dropdown buttons under the header on the left side.

### 🏺 Product Page

- [x] **Image Layout:** Center the product image.
- [x] **Low Stock Warning:** Add an "Only [X] left!" message below the title if the inventory is under 3.
- [x] **Product Details:** Update the description text to the custom copy ("Because each ceramic piece is individually hand-made...").
- [x] **Care Instructions:** Rename the title to "How to love your uniquely made pottery" and update the text.
- [x] **Cleanup:** Remove the "About Pottery" section.
- [x] **Newsletter Integration:** Update "Let’s stay connected" to include an email input and a "Sign Up" button.
- [x] **Recommended Products:** Replace the bottom carousel with a static "You Might Also Like" section showing items from the same category (or random items if none exist).

### 🛒 Cart & Checkout (UI/UX Flow)

- [x] **Checkout Bug (Info Page):** Prevent users from continuing without entering an address. Add an error state.
- [x] **Address Validation:** Call an API to validate UK addresses.
- [x] **Checkout Bug (Shipping Page):** Fix the issue where the page gets stuck and delivery options cannot be selected.
- [x] **Shipping UI Fix:** Add a visual flag/highlight to clearly show which shipping option is currently selected.
- [x] **Shipping Navigation:** Add a "Continue to Payment" button.
- [x] **Checkout Bug (Payment Page):** Fix the routing/blocker that prevents users from reaching the Payment page.
- [x] **Billing Address:** Add a Billing Address option to the payment form (default to "Same as delivery address," with an option to change it).
