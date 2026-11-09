# SimpleXplore — Affiliate Product Discovery & Shopping Platform

> **Shop Smart • Explore More**  
> An affiliate product discovery and comparison shopping website tailored for the Indian market, featuring an automated Telegram channel link importer, admin draft review queue, and safe affiliate redirect engine.

---

## 🌟 Key Capabilities

1. **Modern Shopping Discovery Experience**
   - High-taste Amazon-style responsive product grids and cards.
   - Clean Indian Rupee (`₹` / `INR`) formatting and verified discount badges.
   - Categorized browsing across Fashion, Footwear, Electronics, Beauty, Home & Kitchen, and Lifestyle.
   - Curated sections: *Trending Right Now*, *Latest Verified Deals*, *Featured Picks*, and *Recently Added*.
   - Private client-side & Supabase-synced customer wishlist.

2. **Telegram Affiliate Link Automation (Core Feature)**
   - **Official Telegram Bot API Webhook integration** with secret token verification (`X-Telegram-Bot-Api-Secret-Token`).
   - Auto-detects affiliate product links posted to your Telegram channel (supports single and multiple URLs per post).
   - Resolves shortened affiliate links (`amzn.to`, `fkrt.it`, `bit.ly`) safely while preserving affiliate tracking parameters.
   - Server-Side Request Forgery (SSRF) protection blocking private IP ranges, loopbacks, and cloud metadata endpoints.
   - Extracts product metadata via OpenGraph, JSON-LD, Twitter cards, and semantic HTML without bypassing anti-bot gates.
   - **MANDATORY DRAFT CONSTRAINT**: Every Telegram-imported product is saved strictly as a **DRAFT**. No product is ever published automatically until you review, edit, and click **Approve & Publish** in the Admin Portal.
   - In-dashboard **Live Telegram Simulator** to test post imports instantly without needing third-party tunnels during development.

3. **Secure Master Admin Portal**
   - Single-admin security model with server-side role verification and database Row Level Security (RLS). No public admin signup.
   - **Telegram Staging Review Queue**: Side-by-side view of the original Telegram message, extracted product data, and an interactive live preview of the public product card.
   - **Manual Product Management**: Add, edit, delete, unpublish, and feature products with custom SEO titles and highlights.
   - **Bulk CSV / Excel Upload**: Drag-and-drop batch importer with downloadable template generation, row-level validation, and error reporting.
   - **Outbound Click Analytics**: Tracks referral clicks, traffic campaigns, and merchant distributions (Amazon India, Flipkart, Myntra, Nykaa).
   - **Website Customization**: Configure brand tagline, primary color, contact email, social links, and legal affiliate disclosures.

4. **SEO & Legal Compliance**
   - Full FTC and Indian Advertising Standards Council affiliate disclosures on every product card, detail page, and dedicated `/affiliate-disclosure` page.
   - Schema.org structured data (`Product`, `Offer`, `AggregateRating`) injected via JSON-LD.
   - Dynamic XML Sitemap (`/sitemap.xml`) and search crawler directives (`/robots.txt`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript & React 18
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth
- **HTML & Metadata Extraction**: Cheerio
- **Spreadsheets**: SheetJS (`xlsx`) for CSV & XLSX generation and parsing
- **Testing**: Vitest test runner

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
cd SimpleXplore
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-random-webhook-secret
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=long-random-password         # demo mode only
ADMIN_SESSION_SECRET=at-least-32-random-chars  # signs the admin session cookie
NEXT_PUBLIC_DEMO_MODE=true
```
*(Note: With `NEXT_PUBLIC_DEMO_MODE=true`, SimpleXplore runs with full mock fixtures out of the box so you can test all features immediately!)*

### 3. Run Supabase Database Migration
When connecting your live Supabase project, run the migrations in order:
```bash
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_harden_admin_roles.sql
supabase/migrations/003_storage_product_images.sql
supabase/migrations/004_telegram_update_queue.sql
supabase/migrations/005_audit_log_details.sql
```
Migration 005 makes the admin audit log append-only and records the admin's email (Admin → Audit Log).
Migration 004 adds the Telegram processing queue: the webhook stores each post and replies to Telegram immediately, and extraction runs in the background (Vercel `waitUntil`). A daily Vercel Cron (`vercel.json`) calls `/api/telegram/process` as a safety net for anything left behind — set `CRON_SECRET` in Vercel. Admins can also click **Process queue now** on the Telegram page. Failed runs are retried up to 3 times, 5 minutes apart.
Migration 003 creates the public `product-images` storage bucket used by admin image uploads (in demo mode uploads are saved to `public/uploads/` instead, which does not work on serverless hosts).
This initializes all tables, indexes, triggers, seed categories, and Row Level Security (RLS) policies. Migration 002 stops customers from changing their own role and makes every new sign-up a customer.

### Admin account
There is exactly one administrator and no public admin sign-up.

- **Demo mode (no Supabase):** sign in at `/login` with `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
- **Live mode (Supabase):** create the account in Supabase Auth, then grant the role once from the SQL editor:
  ```sql
  update public.profiles set role = 'admin' where email = 'admin@your-domain.com';
  ```

On success the server sets a signed, httpOnly `sx_admin_session` cookie (HMAC-SHA256 with `ADMIN_SESSION_SECRET`, 8-hour expiry). Middleware and every `/api/admin/*` handler verify it server-side.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public discovery website.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to view the Admin Dashboard.

---

## 🤖 Telegram Bot Setup & Channel Workflow

### Step 1: Create Your Bot
1. Open Telegram and search for **@BotFather**.
2. Send `/newbot`, name your bot (e.g., `SimpleXplore Deals Bot`), and pick a username ending in `bot`.
3. Copy the HTTP API token provided by BotFather into `TELEGRAM_BOT_TOKEN` in your `.env.local`.

### Step 2: Add Bot as Channel Administrator
1. Open your Telegram affiliate channel.
2. Go to **Channel Settings** → **Administrators** → **Add Administrator**.
3. Search for your bot's username and add it with permission to **Post Messages** and **Edit Messages**.

### Step 3: Register the Webhook
Register your SimpleXplore webhook URL using Telegram's API:
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-domain.com/api/telegram/webhook",
       "secret_token": "<TELEGRAM_WEBHOOK_SECRET>"
     }'
```

### Step 4: The Publishing Workflow
```
[Post in Telegram Channel]
         │
         ▼
[Webhook Received & Verified]
         │
         ▼
[Safe URL Unshortening & SSRF Check]
         │
         ▼
[Product Metadata Extraction]
         │
         ▼
[Stored as DRAFT in Admin Queue]  <─── (Strictly unpublished)
         │
         ▼
[Admin Reviews, Edits & Approves]
         │
         ▼
[Live on SimpleXplore Storefront]
```

---

## 🧪 Automated Testing

Run the test suite verifying Telegram webhook parsing, SSRF URL security, draft constraints, and currency formatters:
```bash
npm test
```

All 9 critical test suites pass out-of-the-box:
```
 ✓ tests/formatters.test.ts (4 tests)
 ✓ tests/telegram.test.ts (5 tests)
   - extracts multiple URLs correctly from a message
   - extracts price hints from Indian currency text
   - blocks private IPs, localhost and AWS metadata to prevent SSRF
   - CRITICAL RULE: Telegram-imported products must be created strictly as DRAFT
   - Product is published ONLY after admin explicitly calls approveAndPublish
```

---

## 🛡️ Production Security Checklist

- [x] Server-side secret isolation: `SUPABASE_SERVICE_ROLE_KEY` and `TELEGRAM_BOT_TOKEN` are never bundled in client code.
- [x] SSRF guard (`isSafeExternalUrl`) blocks localhost, private IPv4/IPv6, and cloud metadata (`169.254.169.254`).
- [x] Webhook authenticity verified via `x-telegram-bot-api-secret-token` (constant-time compare; rejected when the secret is unset).
- [x] Admin access via a signed httpOnly session cookie, enforced in middleware and in every admin API handler; login is rate-limited.
- [x] Draft products are never publicly viewable or redirectable; the admin gets a noindex preview.
- [x] JSON-LD output is escaped against script injection from untrusted product text.
- [x] Idempotent Telegram update handler preventing duplicate processing.
- [x] Outbound affiliate links redirect with `302`, `X-Robots-Tag: noindex, nofollow`, and `rel="nofollow sponsored"`.
- [x] Customer wishlist isolation via private user IDs and Row Level Security.

## 🔎 SEO

- Per-page titles, descriptions and canonical URLs; filtered/search catalog URLs are `noindex` and canonicalize to `/products`.
- Structured data: Organization, WebSite (with SearchAction), BreadcrumbList, ItemList on listing pages, and Product — offers and ratings only when the data is actually stored (no invented availability or review counts).
- `/sitemap.xml` (published products only), `/robots.txt`, web manifest, SVG icon and a generated Open Graph image.
- Self-hosted fonts via `next/font`, optimized images via `next/image`; the hero headline is never rendered at opacity 0 (protects LCP).
- Set `NEXT_PUBLIC_SITE_URL` to your production domain so canonicals and the sitemap use it.

