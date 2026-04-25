# Curly Pottery - E-commerce Website

A Next.js 16 e-commerce platform for handmade pottery and ceramics.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### Required Environment Variables

#### Database

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Authentication (NextAuth.js)

```env
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### App Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

#### Payment Providers

**SumUp** (required for checkout):

```env
SUMUP_API=your_sumup_api_key
SUMUP_MERCHANT_CODE=your_merchant_code
```

**Klarna** (optional - add for buy now, pay later):

```env
# Get credentials from merchantportal.klarna.com
KLANA_API_URL=https://api.klarna.com
KLANA_MERCHANT_ID=your_merchant_id
KLANA_SHARED_SECRET=your_shared_secret

# For testing, use sandbox:
# KLANA_API_URL=https://api-sandbox.klarna.com
```

#### Email (Resend)

```env
RESEND_API_KEY=re_123456789
```

#### Analytics (optional)

```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=eu.i.posthog.com
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Image Storage

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

---

## Features

### Admin Panel (`/admin`)

- **Products**: Create, edit, delete products with variants
- **Categories**: Manage product categories
- **Orders**: View and manage customer orders
- **Newsletter**: Compose and send newsletters

### Payment Options

1. **SumUp** (default) - Credit/debit card payments
2. **Klarna** - Buy now, pay later or in installments

### Newsletter System

- Guest email capture from footer
- Registered-user opt-in syncing
- Admin composer at `/admin/newsletter`
- Tracked opens, clicks, and unsubscribe links

### Cache Revalidation

Product updates in the admin panel automatically refresh:

- `/shop` - Public shop page
- `/admin/products` - Admin product list
- Product detail pages

---

## Development Scripts

```bash
npm run dev        # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run test      # Run tests
npm run typecheck # TypeScript check
```

---

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables for Production

Ensure these are set in your deployment platform:

- `DATABASE_URL` - PostgreSQL database URL
- `NEXTAUTH_SECRET` - Generated secret key
- `SUMUP_API` / `SUMUP_MERCHANT_CODE` - SumUp credentials
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

---

## API Routes

| Endpoint                 | Purpose                   |
| ------------------------ | ------------------------- |
| `/api/auth/*`            | Authentication routes     |
| `/api/payments/sumup/*`  | SumUp payment processing  |
| `/api/payments/klarna/*` | Klarna payment processing |
| `/api/newsletter/*`      | Newsletter management     |
| `/api/images`            | Image upload handling     |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS 4
- **Payments**: SumUp, Klarna
- **Email**: Resend + React Email
- **Analytics**: PostHog, Google Analytics
- **Error Tracking**: Sentry
