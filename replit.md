# Online Banking Platform

## Overview

This is a modern, responsive online banking platform built with React, Express, and PostgreSQL. The application features a complete user authentication system, admin dashboard, real-time messaging, and a professional banking interface. The system is designed to handle user registration, account approval workflows, and secure communication between users and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom banking theme variables
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Session-based auth with bcrypt password hashing
- **Database Provider**: Neon serverless PostgreSQL

### Key Design Decisions
1. **Monorepo Structure**: Client, server, and shared code in a single repository for easier development
2. **Type Safety**: Shared TypeScript schemas between frontend and backend using Zod
3. **Component-First UI**: Modular UI components with consistent design system
4. **Serverless Database**: Neon PostgreSQL for scalable, managed database hosting

## Key Components

### Authentication System
- **User Registration**: Complete signup flow with form validation
- **User Login**: Secure authentication with session management
- **Password Security**: Bcrypt hashing with strength validation
- **Session Management**: Server-side session storage with expiration

### User Management
- **Account Status Workflow**: Pending → Approved/Rejected states
- **User Roles**: Regular users and admin users with different permissions
- **Profile Management**: User profile updates and account information

### Messaging System
- **Real-time Communication**: Direct messaging between users and admins
- **Message History**: Persistent conversation storage
- **Read Status**: Message read/unread tracking
- **Admin Interface**: Centralized messaging management for administrators

### Admin Dashboard
- **User Management**: View and manage all user accounts
- **Status Updates**: Approve, reject, or suspend user accounts
- **System Statistics**: Overview of platform metrics
- **Message Management**: Handle user communications

## Data Flow

### User Registration Flow
1. User submits registration form with validation
2. Password is hashed using bcrypt
3. User account created with "pending" status
4. Admin receives notification for account review
5. Admin approves/rejects account through dashboard

### Authentication Flow
1. User provides credentials (username/email + password)
2. Server validates credentials and creates session
3. Session ID stored in localStorage for subsequent requests
4. Protected routes check session validity
5. Automatic redirect based on user role (admin vs regular user)

### Messaging Flow
1. Users can send messages to admins regardless of account status
2. Messages stored in database with sender/receiver tracking
3. Real-time updates through query invalidation
4. Read status tracking for message management

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Uses connection pooling for optimal performance
- **Migrations**: Drizzle Kit for schema migrations

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **Vite**: Development server with hot module replacement

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: ESBuild bundles Express server for Node.js
3. **Database Setup**: Drizzle migrations create required tables
4. **Environment Variables**: Database URL and session secrets

### Production Configuration
- **Static Assets**: Frontend built to `dist/public` directory
- **Server Bundle**: Backend compiled to `dist/index.js`
- **Database**: Connection via DATABASE_URL environment variable
- **Session Storage**: PostgreSQL-based session storage for scalability

### Environment Requirements
- Node.js runtime environment
- PostgreSQL database (Neon or compatible)
- Environment variables for database connection and secrets