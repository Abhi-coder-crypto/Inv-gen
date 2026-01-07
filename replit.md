# InvoiceFlow - Invoice Generator Web Application

## Overview

InvoiceFlow is a modern, full-stack invoice generator web application designed for professional invoice creation, client management, payment tracking, and export functionality. The application provides a complete business invoicing solution with features including company profile management, client database, invoice generation with line items, payment status tracking, and dashboard analytics.

The tech stack consists of a React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and shadcn/ui component library for the user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for client-side routing with protected route patterns
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for dashboard analytics visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Local Strategy, session-based auth using express-session
- **Password Security**: Scrypt hashing with timing-safe comparison
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **API Design**: RESTful endpoints with Zod schema validation on both client and server

### Data Layer
- **Database**: PostgreSQL (requires DATABASE_URL environment variable)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Validation**: drizzle-zod generates Zod schemas from database tables

### Shared Code Architecture
- **Route Definitions**: `shared/routes.ts` exports typed API route definitions with input/output schemas
- **Schema Sharing**: Database types and insert schemas are shared between client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared directory

### Key Data Models
- **Users**: Authentication with username/password, role-based (admin/staff)
- **Companies**: Single company profile with business details, bank info, logo
- **Clients**: Customer records with contact information
- **Invoices**: Invoice documents with line items stored as JSONB, status tracking, tax/discount calculations

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: esbuild bundles server code, Vite builds client to `dist/public`
- **Database Migrations**: `npm run db:push` uses drizzle-kit to sync schema

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### Third-Party Libraries
- **Radix UI**: Headless UI primitives for accessible components (dialog, dropdown, tabs, etc.)
- **Recharts**: Chart library for dashboard revenue visualization
- **date-fns**: Date formatting and manipulation
- **Zod**: Runtime type validation for API inputs and form data

### Development Tools
- **Vite Plugins**: Replit-specific plugins for error overlay, cartographer, and dev banner
- **TypeScript**: Strict mode enabled, path aliases configured for imports

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret for session signing (defaults to "r3pl1t" in development)