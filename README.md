<div align="center">

# 🛒 Commerza Engine

### *High-Performance, Single-Instance Digital Commerce Platform*

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/MySQL_%2F_MariaDB-003545?style=for-the-badge&logo=mysql&logoColor=white)](https://mariadb.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Commerza</b> is an enterprise-grade, self-hosted digital product commerce engine designed for creators, software agencies, and digital entrepreneurs who require total ownership of their storefront, customer relationships, and revenues—with zero marketplace cuts.
</p>

[Key Features](#-key-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quickstart](#-quickstart-guide) • [API Documentation](#-api-endpoints--swagger) • [Security](#-security--production-hardening)

---

</div>

## 📌 Executive Summary

Unlike multi-tenant marketplaces or generic SaaS e-commerce platforms (Gumroad, LemonSqueezy, Shopify), Commerza is purpose-built as a **single-instance, white-labeled commerce system**:

* **One Store • One Brand • One Administrator • Infinite Scale**
* **Instant Digital Fulfillment**: Cryptographically signed token delivery engine with expiry and download quotas.
* **Pluggable Architecture**: Switch payment gateways (Stripe, Razorpay, Mock), email engines (Resend, SMTP, Mock), and storage providers (AWS S3, Cloudflare R2, Local Disk) on the fly without redeploying code.
* **Optimized for Ad Conversion & SEO**: Zero layout shifts, instant server-rendered pages, sub-100ms API response times, and dynamic brand CSS injection.

---

## 🏗 System Architecture

Commerza is architected as a **Modular Monolith** adhering to strict **Clean Architecture** and **CQRS-lite** principles.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Next.js 16 App Router)"]
        SF["🛒 Branded Storefront\n(Dynamic Theming & SSR)"]
        AD["⚙️ Admin Control Center\n(Analytics, Catalog, Settings)"]
        DL["🔒 Secure Download Portal\n(Cryptographic Token Auth)"]
    end

    subgraph Gateway ["API Gateway & Security (NestJS v11)"]
        RL["🛡️ Throttler (Rate Limiter)\n100 req/min per IP"]
        HL["🔐 Helmet & CORS Guard"]
        TI["🔄 Transform & Stream Interceptors"]
    end

    subgraph CoreEngine ["Commerza Core Engine (CQRS-lite)"]
        direction TB
        subgraph CQRS ["Domain Logic"]
            CMD["Command Services (Writes & Validations)"]
            QRY["Query Services (Fast Read Projections)"]
        end
        EB["⚡ Event Bus (EventEmitter2)\npayment.received • order.fulfilled"]
    end

    subgraph Strategies ["Runtime Strategy Registries (Pluggable)"]
        PAY["💳 Payment Strategies\n• Stripe\n• Razorpay\n• Mock (Dev)"]
        STR["📦 Storage Strategies\n• AWS S3 / Cloudflare R2\n• Local File System"]
        EML["✉️ Email Strategies\n• Resend REST API\n• SMTP Protocol\n• Mock Logger"]
        DEL["🚀 Delivery Strategies\n• Internal Streaming\n• External Target Redirection"]
    end

    subgraph Persistence ["Persistence & Storage"]
        DB[("🗄️ MariaDB / MySQL\n(Prisma ORM)")]
        S3[("☁️ File Storage\n(Protected S3 Buckets / Local Vault)")]
    end

    SF -->|REST / JSON| RL
    AD -->|JWT + RBAC| RL
    DL -->|Raw Stream GET| RL

    RL --> HL --> TI
    TI --> QRY
    TI --> CMD

    CMD --> EB
    EB -.->|Async Trigger| CMD

    CMD --> PAY
    CMD --> STR
    CMD --> EML
    CMD --> DEL

    QRY --> DB
    CMD --> DB
    STR --> S3
```

### Architectural Principles

1. **CQRS-Lite Domain Separation**:
   * **Query Services**: Read operations returning optimized view DTOs directly from the persistence layer.
   * **Command Services**: State mutators executing business invariants, transactional integrity, and publishing domain events.
2. **Dynamic Strategy Registry**:
   * Swappable infrastructure drivers registered via runtime factories (`PaymentFactory`, `StorageFactory`, `EmailFactory`, `DeliveryFactory`).
3. **Decoupled Asynchronous Processing**:
   * Asynchronous event dispatching via `EventEmitter2` isolates webhook ingestion from heavy order fulfillment and notifications.
4. **Hierarchical Configuration Hierarchy**:
   * Runtime configuration resolution with cascading overrides:
     $$\text{System Default} \rightarrow \text{Global} \rightarrow \text{Brand} \rightarrow \text{Product} \rightarrow \text{Order Override}$$

---

## ✨ Key Features

### 🛍️ Storefront & Conversion Optimization
* **Lightning Fast Next.js 16 Storefront**: Full Server-Side Rendering (SSR) with React 19.
* **Dynamic Brand Theming**: Primary and secondary colors injected directly into CSS custom properties (`@theme inline`), eliminating Flash of Unstyled Content (FOUC).
* **Frictionless Checkout Flow**: Instant one-click checkout modal with dynamic order calculation and coupon discount validation.
* **Catalog Exploration**: Real-time product search, instant category filtering, and responsive media galleries.

### 🛡️ Secure Digital Delivery Engine
* **Tamper-Proof Tokens**: Generates 32-byte cryptographic hex tokens linked to verified transactions.
* **Enforced Download Limits**: Configurable max download attempts per order with automatic link expiration (e.g., 24 hours / 5 downloads).
* **Direct Binary Streaming**: Bypass interceptors ensure large zip/pdf files are streamed directly without buffering or JSON corruption.
* **Audit Trail**: Real-time IP, user agent, and timestamp tracking for every download attempt.

### 🎛️ Administrator Control Center
* **Live Revenue Analytics**: Overview cards for total gross volume, active orders, customer acquisition, and conversion metrics.
* **Digital Catalog Management**: Rich product editor with multi-asset upload support, SEO metadata fields, pricing/sale prices, and delivery configuration.
* **Dynamic Provider Switcher**: Switch between Stripe, Razorpay, AWS S3, Resend, and SMTP right from the settings tab.
* **Discounts & Coupons**: Percentage or fixed-amount discount codes with expiration dates and usage quota caps.
* **Audit Logs & Feature Flags**: Real-time inspection of administrative actions and instant runtime feature toggling.

---

## 🧰 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | [NestJS 11](https://nestjs.com/) | Progressive Node.js TypeScript architecture |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) | App Router, Server Components, React 19 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | CSS-first configuration with custom theme directives |
| **Database & ORM** | [Prisma 7](https://www.prisma.io/) + MySQL / MariaDB | Type-safe migrations and declarative schema |
| **Payment Gateways** | Stripe & Razorpay | Native REST & SDK-free webhook verification |
| **Transactional Email** | Resend API & SMTP (Nodemailer) | Asynchronous post-purchase fulfillment delivery |
| **Asset Storage** | AWS S3 & Local Disk | Secure pre-signed URLs or protected file streaming |
| **Security & Guarding** | `@nestjs/throttler`, Helmet, JWT | Global rate limiting, CSP, RBAC permissions |
| **API Documentation** | Swagger / OpenAPI 3.0 | Auto-generated interactive endpoint catalog |

---

## 📂 Repository Structure

```text
Commerza/
├── backend/                         # NestJS Backend API Engine
│   ├── prisma/
│   │   ├── schema.prisma            # Declarative database schema
│   │   └── seed.ts                  # Database seeder (Roles, Brand, Super Admin)
│   ├── src/
│   │   ├── common/                  # Global filters, guards, and interceptors
│   │   ├── modules/                 # Modular business domains
│   │   │   ├── auth/                # JWT Auth, RolesGuard & RBAC decorators
│   │   │   ├── brand/               # Brand & multi-tenant configuration
│   │   │   ├── coupon/              # Discount & coupon calculation
│   │   │   ├── customer/            # Customer records & history
│   │   │   ├── delivery/            # Secure binary download streaming & token auth
│   │   │   ├── feature-flags/       # Runtime toggleable feature management
│   │   │   ├── notification/        # Transactional messaging handlers
│   │   │   ├── order/               # Order Command & Query services
│   │   │   ├── payment/             # Payment webhook controller & event bus
│   │   │   ├── product/             # Product catalog, media, & SEO
│   │   │   ├── settings/            # Hierarchical settings management
│   │   │   └── storage/             # File upload management & controllers
│   │   ├── providers/               # Dynamic Strategy Factory Registries
│   │   └── strategies/              # Concrete implementations (Stripe, S3, Resend...)
│   └── test/                        # Unit and End-to-End (E2E) suites
│
├── frontend/                        # Next.js 16 Storefront & Admin Portal
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── admin/               # Unified Admin Dashboard & Analytics
│   │   │   ├── checkout/            # Checkout & gateway dispatch
│   │   │   ├── download/[token]/    # Secure download verification & delivery page
│   │   │   ├── products/[slug]/     # Dynamic product detail page
│   │   │   └── success/[orderId]/   # Post-purchase receipt & instructions
│   │   ├── components/              # Shared reusable UI component library
│   │   ├── features/                # Domain-specific client logic & gateway loaders
│   │   └── utils/                   # Formatters, assertions, and helpers
│
├── docs/                            # Deep-dive architecture and standards
├── dev.js                           # Unified full-stack development orchestrator
├── package.json                     # Monorepo task definitions
└── pnpm-workspace.yaml              # Monorepo workspace configuration
```

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js**: `v20.0.0` or higher (Node 22/24 recommended)
* **Package Manager**: `pnpm` (or `npm`)
* **Database**: MySQL or MariaDB running on port `3306` (e.g., via XAMPP, Docker, or native service)

### 1. Clone & Install Dependencies

```bash
git clone <your-repository-url>
cd Commerza

# Install root dependencies
pnpm install

# Install backend & frontend packages
cd backend && pnpm install
cd ../frontend && pnpm install
cd ..
```

### 2. Configure Environment Variables

#### Backend Configuration:
Create `backend/.env` based on `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/commerza"
JWT_SECRET="super-secret-jwt-key-replace-in-production"
JWT_EXPIRY="7d"

# Strategy Defaults (MOCK for zero-config local dev)
STORAGE_PROVIDER="LOCAL"    # Options: LOCAL, S3
PAYMENT_PROVIDER="MOCK"     # Options: MOCK, STRIPE, RAZORPAY
EMAIL_PROVIDER="MOCK"       # Options: MOCK, SMTP, RESEND
```

#### Frontend Configuration:
Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### 3. Initialize & Seed Database

```bash
cd backend

# Push Prisma schema to MySQL
pnpm prisma db push

# Seed initial roles, default brand, and Super Admin user
pnpm prisma db seed
```

> **Default Administrator Credentials (from seed):**
> * **Email:** `admin@commerza.com`
> * **Password:** `admin123`

### 4. Launch Development Environment

Run the unified full-stack orchestrator:

```bash
node dev.js
```

This single command:
1. Verifies that MySQL is alive on port `3306` (auto-spins up local XAMPP MySQL if detected).
2. Spawns the **NestJS Backend** at `http://localhost:3000`.
3. Spawns the **Next.js Frontend** at `http://localhost:3001`.
4. Synchronizes colored output streams and handles graceful shutdown (`Ctrl + C`).

---

## 🔑 Environment Configuration Reference

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | HTTP Port for the NestJS API | `3000` |
| `DATABASE_URL` | Backend | MariaDB/MySQL connection URI | `mysql://root:pass@localhost:3306/commerza` |
| `JWT_SECRET` | Backend | Secret key used for signing administrative tokens | `your-secret-key` |
| `PAYMENT_PROVIDER` | Backend | Active payment strategy | `MOCK` \| `STRIPE` \| `RAZORPAY` |
| `STORAGE_PROVIDER` | Backend | Active file storage strategy | `LOCAL` \| `S3` |
| `EMAIL_PROVIDER` | Backend | Active email delivery provider | `MOCK` \| `SMTP` \| `RESEND` |
| `STRIPE_SECRET_KEY` | Backend | Stripe API Secret Key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`| Backend | Stripe Webhook Signing Secret | `whsec_...` |
| `RAZORPAY_KEY_ID` | Backend | Razorpay Public Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay Secret Key | `...` |
| `RAZORPAY_WEBHOOK_SECRET`| Backend| Razorpay Webhook HMAC Secret | `...` |
| `RESEND_API_KEY` | Backend | Resend Transactional Email Key | `re_...` |
| `AWS_ACCESS_KEY_ID` | Backend | AWS S3 / Cloudflare R2 Access Key | `...` |
| `AWS_BUCKET_NAME` | Backend | S3 Bucket name for digital assets | `commerza-assets` |
| `NEXT_PUBLIC_API_URL`| Frontend| Public backend API endpoint | `http://localhost:3000/api/v1` |

---

## 📡 API Endpoints & Swagger

Interactive Swagger OpenAPI documentation is available locally at:
👉 **`http://localhost:3000/api/v1/docs`**

### Core Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate admin user & issue JWT | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Bearer Token |
| `GET` | `/api/v1/brands/subdomain/:subdomain` | Fetch brand configuration & theme variables | Public |
| `GET` | `/api/v1/products` | Retrieve active product catalog with filters | Public |
| `GET` | `/api/v1/products/:slug` | Retrieve single product details & SEO tags | Public |
| `POST` | `/api/v1/orders` | Initialize checkout & create pending order | Public |
| `POST` | `/api/v1/orders/mock-fulfill/:id` | Test order fulfillment (Dev mode only) | Guarded (MOCK only)|
| `POST` | `/api/v1/payments/webhook` | Ingest Stripe / Razorpay webhook events | HMAC Signature |
| `GET` | `/api/v1/download/:token` | Validate download token & metadata | Public |
| `GET` | `/api/v1/download/d/:token` | Stream binary product asset or redirect | Token Validated |
| `POST` | `/api/v1/coupons/validate` | Check discount coupon validity | Public |
| `POST` | `/api/v1/settings` | Save hierarchical system or brand setting | Bearer + Role |

---

## 🔒 Security & Production Hardening

* **Rate Limiting (`ThrottlerModule`)**: Protected globally with a threshold of 100 requests per minute per IP address, preventing brute-force attacks and download scraping.
* **Cryptographic Webhook Verification**: Raw payload buffer preservation (`rawBody: true`) guarantees 100% accurate HMAC signature verification for Stripe (`stripe-signature`) and Razorpay (`x-razorpay-signature`).
* **Mock Fulfillment Quarantine**: Mock fulfillment endpoints verify `PAYMENT_PROVIDER === 'MOCK'` at runtime; in live production environments, unauthorized calls are immediately rejected with `403 Forbidden`.
* **Zero Binary Corruption**: Custom interceptor exempts `/download/d/*` routes from standard `{ success: true, data }` JSON wrapping, ensuring streaming fidelity for ZIP, PDF, audio, and video payloads.
* **Role-Based Access Control (RBAC)**: Fine-grained permissions matrix (`SUPER_ADMIN`, `BRAND_ADMIN`, `SUPPORT`) enforced via NestJS metadata reflection and declarative guards.

---

## 🧪 Testing & Quality Assurance

```bash
# Run backend unit tests
cd backend && pnpm test

# Run end-to-end integration tests (including secure download flow)
pnpm test:e2e

# Run linter & code formatting
pnpm lint
pnpm format
```

---

## 📄 License

This project is licensed under the **MIT License** — feel free to customize, self-host, and adapt it for personal or commercial projects.

<div align="center">
  <sub>Built with care for creators and digital builders everywhere.</sub>
</div>
