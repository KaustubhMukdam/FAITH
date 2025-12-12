# FAITH Backend API

Backend service for FAITH - Finance AI Tracker & Helper

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Zod

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 6+

### Installation

**1. Install dependencies**
```bash
npm install
```

**2. Setup environment**
```bash
cp .env.example .env
# Update .env with your database credentials
```

**3. Run migrations**
```bash
npm run migrate
```

**4. Start development server**
```bash
npm run dev
```

---

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

---

## API Endpoints

### Health Check
- `GET /health` - API health status

### Authentication (Coming in next steps)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

---

## Database Schema

See `src/database/migrations/` for complete schema.

**Main tables:**
- `users` - User accounts
- `user_preferences` - User settings
- `transactions` - Financial transactions
- `budgets` - Monthly budgets
- `budget_allocations` - Budget category allocations
- `aa_consents` - Account Aggregator consents
- `linked_bank_accounts` - Linked bank accounts

---

## Environment Variables

See `.env.example` for all required environment variables.