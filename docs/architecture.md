# Commerza Platform Architecture

This document describes the enterprise-grade Clean Architecture patterns implemented in Commerza.

## Design Patterns

### 1. CQRS-lite Separation
Every business domain module splits operations into Query (Reads) and Command (Writes):
- **Query Services**: Read operations returning mapped view DTOs.
- **Command Services**: State mutators executing business validations and firing domain events.

### 2. Strategy Pattern
Dynamic strategy factory registries resolve providers at runtime:
- Storage Strategy (Local, S3)
- Payment Strategy (Mock, Stripe)
- Email Strategy (Mock, SMTP)
- Delivery Strategy (Internal Redirect, External Target URL)

### 3. Repository Pattern
To prevent direct dependence on Prisma inside business services, we use a custom Repository layer.

### 4. Cache & Queue Engine Abstractions
Decoupled Redis Cache and BullMQ Queue implementations with developer fallback strategies.
