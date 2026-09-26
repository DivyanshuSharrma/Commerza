# Commerza – Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Ready for Development
**Project Type:** Single-Instance Digital Product Commerce Platform
**Architecture:** Clean Architecture + Modular Monolith
**Target Release:** v1

---

# 1. Overview

Commerza is a modern digital product commerce platform built for creators, businesses, agencies, educators, and startups to sell downloadable digital products from a single branded storefront.

Unlike SaaS marketplaces, Commerza is a **single-instance commerce engine** managed by one administrator.

The platform focuses on:

- High conversion
- Fast checkout
- Secure downloads
- SEO optimization
- Excellent Meta Ads Quality Score
- Maintainable architecture
- Production-ready backend

---

# 2. Goals

Primary Goals

- Sell digital products
- Deliver products instantly after payment
- Simple administration
- Fast storefront
- Secure download system
- Excellent user experience

Business Goals

- High conversion rate
- Low checkout abandonment
- Low operational cost
- Easy maintenance
- Easy deployment

Technical Goals

- Clean Architecture
- Modular codebase
- Production-ready
- Highly scalable
- Easy provider switching

---

# 3. Non Goals

Commerza is NOT:

- SaaS
- Marketplace
- Multi Vendor
- Multi Tenant
- Subscription Platform
- LMS
- CRM

There is:

- One Store
- One Brand
- One Admin
- Many Products
- Many Customers

---

# 4. Target Users

Administrator

Responsible for:

- Product management
- Orders
- Customers
- Coupons
- Analytics
- Brand
- Settings

Customer

Can:

- Browse products
- Purchase products
- Download purchased files
- Receive emails

---

# 5. Core Features

## Storefront

- Landing Page
- Product Listing
- Product Details
- Checkout
- Payment
- Success Page
- Download Page

---

## Admin

- Dashboard
- Products
- Orders
- Customers
- Coupons
- Brand
- Settings
- Feature Flags
- Analytics
- Audit Logs
- Profile

---

# 6. Functional Requirements

## Products

Administrator can:

- Create Product
- Edit Product
- Delete Product
- Publish
- Unpublish
- Upload Digital Files
- Upload Images
- Configure SEO
- Configure Pricing

Product contains:

- Title
- Slug
- Description
- Price
- Thumbnail
- Digital File
- Category
- Status
- SEO Metadata

---

## Orders

System must:

- Create Order
- Verify Payment
- Fulfill Order
- Send Email
- Generate Download Token
- Track Downloads
- Track Audit Logs

Order Status

- Pending
- Paid
- Failed
- Cancelled
- Refunded
- Completed

---

## Customers

Administrator can:

- View Customers
- Search
- Suspend
- Activate
- View Purchase History

---

## Coupons

Support

- Percentage Discount
- Flat Discount
- Usage Limits
- Expiry Date
- Enable/Disable

Validation

- Active
- Not Expired
- Usage Remaining

---

## Downloads

Must support

- Signed Tokens
- Expiry
- Download Limits
- Logging
- Audit Trail

---

## Brand

Single Brand Configuration

Supports

- Logo
- Favicon
- Colors
- Typography
- Contact
- Footer
- Social Links
- Meta Data

---

## Settings

Providers

Storage

- Local
- Cloudflare R2

Payment

- Mock
- Razorpay

Email

- Mock
- SMTP
- Resend

---

# 7. Feature Flags

Toggle

- Coupons
- Reviews
- Analytics
- Social Login
- Invoices

Must affect backend logic and frontend UI.

---

# 8. Analytics

Dashboard includes

- Revenue
- Orders
- Customers
- Conversion Rate
- Average Order Value
- Downloads
- Product Performance

---

# 9. Authentication

Admin Authentication

JWT

Supports

- Login
- Logout
- Profile
- Password Change

---

# 10. Security Requirements

- JWT Authentication
- Password Hashing
- Input Validation
- DTO Validation
- Rate Limiting
- Download Token Security
- Ownership Validation
- HTTPS
- Secure Headers
- Environment Validation

---

# 11. User Flow

Customer

Landing

↓

Product

↓

Checkout

↓

Payment

↓

Order

↓

Email

↓

Download

↓

Completed

Administrator

Login

↓

Dashboard

↓

Products

↓

Orders

↓

Customers

↓

Analytics

↓

Settings

---

# 12. Technical Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

Backend

- NestJS
- TypeScript
- Prisma ORM

Database

- PostgreSQL

Storage

- Cloudflare R2

Payments

- Razorpay

Email

- Resend

Authentication

- Passport JWT

Caching

- Redis (Production)

Queue

- BullMQ

---

# 13. Architecture

Controller

↓

Service

↓

Repository

↓

Prisma

↓

Database

Patterns

- Repository Pattern
- Factory Pattern
- Strategy Pattern
- CQRS (where applicable)

---

# 14. Admin Modules

Dashboard

Products

Orders

Customers

Coupons

Brand

Settings

Feature Flags

Analytics

Audit Logs

Profile

---

# 15. API Standards

REST API

Versioned

/api/v1

Response

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

---

# 16. Business Rules

- Draft products cannot be purchased.
- Only published products are visible.
- Coupons must be validated before payment.
- Download tokens expire.
- Download limits are enforced.
- Orders cannot transition to invalid states.
- Only active admins can access the dashboard.
- Feature Flags must affect backend behavior.

---

# 17. Non Functional Requirements

Performance

- Fast page loads
- Optimized images
- Lazy loading

Scalability

- Provider abstraction
- Redis support
- Queue support

Maintainability

- Modular architecture
- Small files
- Clear naming
- SOLID principles

Reliability

- Transactions
- Audit logs
- Retry mechanisms
- Health checks

---

# 18. Success Metrics

Business

- Checkout Conversion Rate
- Revenue
- Order Success Rate
- Download Success Rate

Technical

- API Response Time
- Error Rate
- Uptime
- Queue Success Rate

SEO

- Core Web Vitals
- Lighthouse Score
- Meta Ads Landing Quality

---

# 19. Future Roadmap

v1.1

- Reviews
- Invoices
- Better Analytics

v1.2

- Affiliate System
- License Keys
- Webhooks

v2

- Multi Currency
- Advanced Reporting
- AI Recommendations

---

# 20. Project Status

Architecture: Complete

Admin Panel: Complete

Storefront: In Progress

Checkout: In Progress

Payment: In Progress

Download System: In Progress

Business Logic: Hardening

Production Hardening: Pending

Overall Status:

**Development Phase — Feature Completion & Production Hardening**