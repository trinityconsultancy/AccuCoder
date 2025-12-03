# 🏥 AccuCoder - Advanced Medical Coding Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.0-green)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AccuCoder** is a comprehensive medical coding platform designed for healthcare professionals, offering ICD-10 code lookup, AI-powered assistance, and intelligent search capabilities.

## 🚀 Features

### Core Functionality
- **🔍 Advanced Code Search**: Fast, intelligent search across ICD-10-CM codes
- **🤖 AI Assistant**: Powered by Groq SDK for medical coding guidance
- **📊 Comprehensive Tables**: Drug/chemical poisoning, neoplasm, and disease tables
- **🔄 Code Converter**: Convert between different medical coding systems
- **👨‍💼 Admin Dashboard**: Complete review and user management system

### Technical Highlights
- ⚡ **Lightning-fast**: 1.1s production builds with Turbopack
- 🔐 **Secure Authentication**: JWT-based auth with HTTP-only cookies
- 📧 **Email Integration**: Automated emails via Brevo (SendinBlue)
- 🛡️ **Rate Limiting**: Advanced sliding-window rate limiter
- ✅ **Type-Safe**: Full TypeScript with Zod validation
- 🧪 **Well-Tested**: Comprehensive Jest test suite
- 📦 **Optimized Bundle**: 1.24 MB production bundle

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Testing](#testing)
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
│   │   ├── drugs/           # Drug code queries
│   │   └── reviews/         # Review CRUD
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # User dashboard
│   └── [pages]/             # Other pages
├── components/              # React components
│   ├── ui/                  # UI components (shadcn)
│   └── skeletons.tsx        # Loading skeletons
├── lib/                     # Utility libraries
│   ├── models/              # MongoDB models
│   ├── auth/                # Authentication helpers
│   ├── email/               # Email service
│   ├── api-error-handler.ts # Error handling
│   ├── env-validation.ts    # Environment validation
│   ├── rate-limiter.ts      # Rate limiting
│   └── mongodb.ts           # Database connection
├── __tests__/               # Test files
├── public/                  # Static assets
├── styles/                  # Global styles
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
│   ├── api-error-handler.test.ts
│   ├── env-validation.test.ts
│   └── rate-limiter.test.ts
├── components/
│   └── header.test.tsx
└── setup.test.ts
\`\`\`

### Coverage Goals

- **Overall**: 85%+
- **Components**: 80%+
- **API Routes**: 90%+
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
