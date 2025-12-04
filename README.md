# 🏥 AccuCoder - Enterprise Medical Coding Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.0-green)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AccuCoder** is an enterprise-grade medical coding platform designed for healthcare professionals, featuring advanced ICD-10 code lookup, AI-powered assistance, and production-ready backend architecture.

## 🚀 Features

### Core Functionality
- **🔍 Advanced Code Search**: Fast, intelligent search across ICD-10-CM codes
- **🤖 AI Assistant**: Powered by Groq SDK for medical coding guidance
- **📊 Comprehensive Tables**: Drug/chemical poisoning, neoplasm, and disease tables
- **🔄 Code Converter**: Convert between different medical coding systems
- **👨‍💼 Admin Dashboard**: Complete review and user management system

### Enterprise Architecture
- 🏗️ **Layered Architecture**: Controllers, Services, Repositories pattern
- 📝 **Request Logging**: Structured logging with correlation IDs
- 💾 **ACID Transactions**: MongoDB transactions with retry logic
- ⚡ **Advanced Caching**: LRU cache with TTL and pattern invalidation
- 🛡️ **Input Sanitization**: XSS and NoSQL injection protection
- ✅ **Schema Validation**: Runtime type validation with Zod
- 📊 **Health Checks**: Kubernetes-compatible liveness/readiness probes
- 📈 **Metrics**: Prometheus-compatible metrics endpoint

### Technical Highlights
- ⚡ **Lightning-fast**: 4.7s production builds with Turbopack
- 🔐 **Secure Authentication**: JWT-based auth with HTTP-only cookies
- 📧 **Email Integration**: Automated emails via Brevo (SendinBlue)
- 🛡️ **Rate Limiting**: Advanced sliding-window rate limiter
- ✅ **Type-Safe**: Full TypeScript with Zod validation
- 🧪 **Well-Tested**: Comprehensive Jest test suite (50+ tests)
- 📦 **Optimized Bundle**: 1.24 MB production bundle
- 🏢 **Production-Ready**: Enterprise patterns and best practices

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Testing](#testing)
- [Enterprise Features](#enterprise-features)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher (recommended) or npm/yarn
- **MongoDB** 5.0 or higher (local or Atlas)
- **Git** for version control

---

## 📦 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/trinityconsultancy/AccuCoder.git
cd AccuCoder
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
# or
npm install
# or
yarn install
\`\`\`

### 3. Set Up Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your configuration (see [Environment Variables](#environment-variables) section).

### 4. Initialize Database

The application will automatically create indexes and collections on first run. Optionally seed data:

\`\`\`bash
# Run database seed script (if available)
pnpm seed
\`\`\`

---

## 🌍 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accucoder?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Email Service (Brevo/SendinBlue)
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@accucoder.com
BREVO_FROM_NAME=AccuCoder

# AI Service (Groq)
GROQ_API_KEY=your-groq-api-key

# Optional: Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | `a1b2c3d4...` |
| `BREVO_API_KEY` | Brevo API key for emails | `xkeysib-...` |
| `GROQ_API_KEY` | Groq API key for AI assistant | `gsk_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BREVO_FROM_EMAIL` | Email sender address | - |
| `BREVO_FROM_NAME` | Email sender name | - |
| `UPSTASH_REDIS_REST_URL` | Redis URL for distributed rate limiting | - |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | - |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env.local`

### Local MongoDB (Development)

\`\`\`bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data/directory

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/accucoder
\`\`\`

### Database Models

The application uses 6 MongoDB models:

1. **User** - Authentication and user accounts
2. **Profile** - User profiles with certification info
3. **Session** - JWT session management
4. **Review** - User testimonials and reviews
5. **AlphabeticalIndex** - ICD-10 alphabetical index
6. **DrugChemical** - Drug and chemical poisoning codes

---

## 💻 Development

### Start Development Server

\`\`\`bash
pnpm dev
# or
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Structure

\`\`\`
AccuCoder/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── chat/            # AI chat endpoint
│   │   ├── health/          # Health check endpoints
│   │   ├── metrics/         # Metrics endpoint
│   │   └── reviews/         # Review CRUD
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # User dashboard
│   └── [pages]/             # Other pages
├── components/              # React components
│   ├── ui/                  # UI components (shadcn)
│   └── skeletons.tsx        # Loading skeletons
├── lib/                     # Infrastructure & utilities
│   ├── controllers/         # HTTP request handlers
│   ├── services/            # Business logic layer
│   ├── database/            # Data access layer
│   │   └── transactions.ts  # Repository pattern, Unit of Work
│   ├── middleware/          # Request middleware
│   │   └── request-logger.ts # Structured logging
│   ├── security/            # Security utilities
│   │   └── input-sanitization.ts # XSS/NoSQL protection
│   ├── validation/          # Schema validation
│   │   └── schema-validator.ts # Zod-based validation
│   ├── monitoring/          # Observability
│   │   └── health-check.ts  # Health checks & metrics
│   ├── cache/              # Caching layer
│   │   └── cache-manager.ts # LRU cache with TTL
│   ├── api-error-handler.ts # Error handling
│   ├── env-validation.ts    # Environment validation
│   ├── rate-limiter.ts      # Rate limiting
│   └── mongodb.ts           # Database connection
├── models/                  # MongoDB schemas
├── __tests__/               # Test files
│   ├── lib/                # Infrastructure tests
│   └── components/         # Component tests
├── public/                  # Static assets
├── ARCHITECTURE.md          # Architecture documentation
└── [config files]           # Configuration
\`\`\`

### Available Scripts

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
\`\`\`

---

## 🧪 Testing

### Run Tests

\`\`\`bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
\`\`\`

### Test Structure

\`\`\`
__tests__/
├── lib/
│   ├── api-error-handler.test.ts      # Error handling tests
│   ├── env-validation.test.ts         # Environment validation tests
│   ├── rate-limiter.test.ts           # Rate limiting tests
│   ├── security/
│   │   └── input-sanitization.test.ts # XSS/NoSQL protection tests
│   ├── validation/
│   │   └── schema-validator.test.ts   # Schema validation tests
│   └── services/
│       └── services.test.ts           # Service layer tests
├── components/
│   └── header.test.tsx                # Component tests
└── setup.test.ts
\`\`\`

### Test Coverage

- **Total Tests**: 50+ test cases
- **Coverage Goals**:
  - Overall: 85%+
  - Services: 90%+
  - Security: 95%+
  - Components: 80%+

---

## 🏢 Enterprise Features

### 1. Request Logging & Monitoring

**Location**: `lib/middleware/request-logger.ts`

- Structured JSON logging
- Unique correlation IDs for request tracing
- Performance metrics (response time, slow request detection)
- Request/response metadata capture
- Client IP extraction

**Usage**:
\`\`\`typescript
import { withRequestLogging } from '@/lib/middleware/request-logger'

export const GET = withRequestLogging(async (req) => {
  // Your handler code
  return NextResponse.json({ success: true })
})
\`\`\`

### 2. Database Transactions

**Location**: `lib/database/transactions.ts`

- ACID transaction support with MongoDB
- Automatic retry on transient errors (3 attempts)
- Repository pattern for consistent data access
- Unit of Work pattern for atomic operations
- Optimistic locking support

**Usage**:
\`\`\`typescript
import { TransactionManager } from '@/lib/database/transactions'

const result = await TransactionManager.withTransaction(async (session) => {
  const user = await userRepo.create(userData, session)
  const profile = await profileRepo.create({ userId: user._id }, session)
  return { user, profile }
})
\`\`\`

### 3. Advanced Caching

**Location**: `lib/cache/cache-manager.ts`

- LRU (Least Recently Used) eviction strategy
- TTL (Time To Live) support
- Pattern-based cache invalidation
- Cache statistics (hits, misses, hit rate)
- Multiple cache instances (API, Database, Static, Session)

**Usage**:
\`\`\`typescript
import { databaseCache, CacheKeyBuilder } from '@/lib/cache/cache-manager'

// Cache-aside pattern
const user = await databaseCache.getOrSet(
  CacheKeyBuilder.user(userId),
  async () => await User.findById(userId),
  15 * 60 * 1000 // 15 minutes
)
\`\`\`

### 4. Input Sanitization

**Location**: `lib/security/input-sanitization.ts`

- XSS protection (HTML escaping, script removal)
- NoSQL injection prevention
- File upload validation
- Security headers (CSP, X-XSS-Protection, etc.)

**Usage**:
\`\`\`typescript
import { withInputSanitization } from '@/lib/security/input-sanitization'

export const POST = withInputSanitization(async (req) => {
  // Request body is automatically sanitized
  const body = await req.json()
  return NextResponse.json({ success: true })
})
\`\`\`

### 5. Schema Validation

**Location**: `lib/validation/schema-validator.ts`

- Runtime type validation with Zod
- Request/response schema validation
- OpenAPI specification support
- Detailed validation error messages

**Usage**:
\`\`\`typescript
import { withSchemaValidation, CommonSchemas } from '@/lib/validation/schema-validator'

export const POST = withSchemaValidation(
  {
    body: CommonSchemas.userLogin,
    response: z.object({ success: z.boolean() }),
  },
  async (req, validated) => {
    const { email, password } = validated.body!
    // Type-safe access to validated data
    return { success: true }
  }
)
\`\`\`

### 6. Health Checks & Metrics

**Endpoints**:
- `GET /api/health` - Complete health check
- `GET /api/health/liveness` - Kubernetes liveness probe
- `GET /api/health/readiness` - Kubernetes readiness probe
- `GET /api/metrics` - System metrics (JSON)
- `GET /api/metrics?format=prometheus` - Prometheus format

**Health Status Levels**:
- `healthy` - All systems operational
- `degraded` - Some components experiencing issues
- `unhealthy` - Critical components down

### 7. Layered Architecture

**Pattern**: Controllers → Services → Repositories → Models

- **Controllers** (`lib/controllers/`): Handle HTTP requests
- **Services** (`lib/services/`): Contain business logic
- **Repositories** (`lib/database/`): Manage data access
- **Models** (`models/`): Define database schemas

**Benefits**:
- Clear separation of concerns
- Easy testing and mocking
- Maintainable and scalable code
- Industry-standard architecture

### Design Patterns Implemented

1. **Repository Pattern**: Abstract data access layer
2. **Unit of Work Pattern**: Manage transactions
3. **Singleton Pattern**: Logger, cache instances
4. **Decorator Pattern**: Cacheable methods
5. **Middleware Pattern**: Request processing pipeline
6. **Strategy Pattern**: LRU cache eviction

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).
- **Utilities**: 95%+

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import project to Vercel:
   \`\`\`bash
   # Install Vercel CLI
   pnpm add -g vercel
   
   # Deploy
   vercel
   \`\`\`

3. Add environment variables in Vercel dashboard

4. Deploy:
   \`\`\`bash
   vercel --prod
   \`\`\`

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created and whitelisted
- [ ] Email service (Brevo) configured
- [ ] AI service (Groq) API key added
- [ ] Build successful (`pnpm build`)
- [ ] Tests passing (`pnpm test`)
- [ ] Error tracking set up (optional: Sentry)

### Environment Variables in Production

Set all required environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment → Environment Variables
- AWS/Docker: Use `.env.production` or secrets manager

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "certificationBody": "AAPC",
  "certificationTitle": "CPC",
  "aapcId": "12345",
  "organization": "Hospital ABC"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "64abc123..."
}
\`\`\`

#### POST `/api/auth/login`
Authenticate user

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "64abc123...",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

#### GET `/api/auth/session`
Get current session

**Response:**
\`\`\`json
{
  "user": {
    "id": "64abc123...",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

#### POST `/api/auth/logout`
Logout user

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

### Review Endpoints

#### GET `/api/reviews`
Get all reviews (filtered by status)

**Query Parameters:**
- `status`: `pending` | `approved` | `rejected` | `all` (default: `approved`)

**Response:**
\`\`\`json
{
  "reviews": [
    {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Medical Coder",
      "rating": 5,
      "comment": "Great platform!",
      "status": "approved",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
\`\`\`

#### POST `/api/reviews`
Create a new review

**Rate Limit:** 60 requests per minute

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Medical Coder",
  "location": "New York",
  "country": "USA",
  "rating": 5,
  "comment": "Excellent platform!"
}
\`\`\`

#### PATCH `/api/reviews/[id]`
Update review status (admin only)

**Request Body:**
\`\`\`json
{
  "status": "approved"
}
\`\`\`

#### DELETE `/api/reviews/[id]`
Delete a review (admin only)

### AI Chat Endpoint

#### POST `/api/chat`
AI-powered medical coding assistant

**Rate Limit:** 10 requests per minute

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the ICD-10 code for hypertension?"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "The ICD-10 code for essential hypertension is I10...",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
\`\`\`

### Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `AUTHENTICATION_ERROR` (401)
- `AUTHORIZATION_ERROR` (403)
- `NOT_FOUND` (404)
- `CONFLICT_ERROR` (409)
- `RATE_LIMIT_ERROR` (429)
- `INTERNAL_ERROR` (500)

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components

**Backend:**
- Next.js API Routes
- MongoDB with Mongoose
- JWT Authentication
- Groq SDK (AI)

**Infrastructure:**
- Vercel (hosting)
- MongoDB Atlas (database)
- Brevo (email)
- Upstash Redis (optional, rate limiting)

### Key Design Patterns

1. **Error Handling**: Centralized error handler with type-safe error classes
2. **Rate Limiting**: Sliding window algorithm with in-memory storage
3. **Database Connection**: Connection pooling with exponential backoff retry
4. **Environment Validation**: Zod-based runtime validation
5. **Type Safety**: Full TypeScript coverage with strict mode

### Security Features

- 🔐 HTTP-only cookies for session tokens
- 🛡️ Password hashing with bcrypt
- ⚡ Rate limiting on all endpoints
- ✅ Input validation with Zod
- 🔒 CSRF protection
- 📧 Email verification
- 👮 Role-based access control (RBAC)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Prettier for formatting
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Trinity Consultancy**
- GitHub: [@trinityconsultancy](https://github.com/trinityconsultancy)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Groq](https://groq.com/) - AI SDK
- [Brevo](https://www.brevo.com/) - Email service

---

## 📞 Support

For support, email support@accucoder.com or open an issue on GitHub.

---

**Built with ❤️ by Trinity Consultancy**
