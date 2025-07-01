# replit.md

## Overview

This repository is a full-stack web application for "HD Reklam", a Turkish signage and advertising company. The application is built using a modern React frontend with a Node.js Express backend, featuring a unique AI-powered signage overlay tool that allows customers to visualize how different types of signage would look on their building photos.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful API with JSON responses

### Database Schema
The application uses Drizzle ORM with PostgreSQL and includes:
- **Users table**: Basic user authentication (id, username, password)
- **Contact requests table**: Customer inquiries (id, name, email, phone, service_type, message, created_at)
- Schema validation using Drizzle-Zod for type-safe database operations

## Key Components

### AI Signage Overlay Tool
A unique feature that allows customers to:
- Upload photos of their buildings
- Select different signage types (LED, neon, traditional)
- Choose positioning and sizing options
- Generate realistic previews using HTML5 Canvas

### Contact Management System
- Form validation using Zod schemas
- Secure data storage in PostgreSQL
- Real-time form submission with proper error handling

### Responsive Design System
- Mobile-first approach using Tailwind CSS
- Custom component library based on Shadcn/ui
- Consistent theming with CSS variables
- WhatsApp integration for instant communication

## Data Flow

1. **Client-side rendering**: React components handle UI state and user interactions
2. **API communication**: TanStack Query manages API calls with caching and error handling
3. **Form submission**: Contact forms validate data client-side before sending to backend
4. **Database operations**: Drizzle ORM handles type-safe database queries
5. **Image processing**: AI signage overlay processes images entirely client-side using Canvas API

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-kit**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **react-hook-form & @hookform/resolvers**: Form handling and validation
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (20+ components)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority & clsx**: Conditional styling utilities
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- tsx for running TypeScript backend directly
- Concurrent development setup serving both frontend and API

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Production/development mode switching via `NODE_ENV`
- Replit-specific configuration for cloud deployment

## Changelog
- July 1, 2025: Enhanced AI prompt generation system
  - Added advanced Turkish-to-English character conversion
  - Implemented intelligent prompt generation for signage designs
  - Added form validation and error handling
  - Enhanced WhatsApp integration with cleaner business names
- June 29, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.