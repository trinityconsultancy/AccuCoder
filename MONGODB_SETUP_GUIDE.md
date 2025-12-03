# MongoDB Migration Setup Guide

## ✅ Completed Steps

1. **Dependencies Installed**
   - mongoose
   - bcryptjs
   - jsonwebtoken
   - nodemailer

2. **MongoDB Connection** (`lib/mongodb.ts`)
   - Singleton connection with caching
   - Prevents connection leaks

3. **Models Created**
   - `lib/models/User.ts` - User authentication
   - `lib/models/Profile.ts` - User profiles
   - `lib/models/Session.ts` - Session management
   - `lib/models/DrugChemical.ts` - Drug data
   - `lib/models/Review.ts` - User reviews
   - `lib/models/AlphabeticalIndex.ts` - ICD index

4. **Auth Utilities**
   - `lib/auth/password.ts` - Bcrypt hashing
   - `lib/auth/jwt.ts` - JWT token management
   - `lib/auth/middleware.ts` - Auth middleware for API routes

5. **Email Service** (`lib/email/brevo.ts`)
   - Brevo/SMTP integration
   - Verification email
   - Password reset email
   - Invite email templates

6. **API Routes**
   - ✅ `app/api/auth/signup/route.ts` - User registration
   - ✅ `app/api/auth/login/route.ts` - User login
   - ✅ `app/api/auth/logout/route.ts` - User logout
   - ✅ `app/api/auth/verify-email/route.ts` - Email verification
   - ✅ `app/api/auth/session/route.ts` - Session check
   - ✅ `app/api/users/profile/route.ts` - Profile management

## 🚀 Next Steps

### Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user (username + password)
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get your connection string from "Connect" → "Connect your application"
7. Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/accucoder?retryWrites=true&w=majority`

### Step 2: Configure Environment Variables

Copy `.env.mongodb` to `.env.local` and fill in your values:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accucoder

# JWT Configuration (generate a random secret)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Brevo Email Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_email@gmail.com
BREVO_SMTP_PASSWORD=your_brevo_api_key

FROM_EMAIL=noreply@accucoder.com
FROM_NAME=AccuCoder

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Update Frontend Components

Files that need to be updated to use MongoDB API:

1. **`app/signup/page.tsx`**
   - Replace Supabase client with fetch to `/api/auth/signup`
   - Handle email verification flow

2. **`app/login/page.tsx`**
   - Replace Supabase client with fetch to `/api/auth/login`
   - Update cookie/session handling

3. **`components/top-navbar.tsx`**
   - Replace Supabase auth with fetch to `/api/auth/session`
   - Update profile fetching to `/api/users/profile`
   - Update logout to `/api/auth/logout`

4. **`components/public-navbar.tsx`**
   - Update auth state checking

5. **`app/page.tsx`**
   - Update session checking

6. **`app/admin/page.tsx`**
   - Update to use MongoDB API

7. **`app/api/reviews/route.ts`**
   - Update to use MongoDB models

### Step 4: Add Global Type Declarations

Create `global.d.ts` in the root:

```typescript
import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

export {}
```

### Step 5: Create Additional API Routes (if needed)

- `app/api/auth/forgot-password/route.ts` - Request password reset
- `app/api/auth/reset-password/route.ts` - Reset password with token
- `app/api/admin/invite-user/route.ts` - Admin invite users

### Step 6: Test the Migration

1. Start dev server: `pnpm dev`
2. Test signup flow
3. Check email verification
4. Test login flow
5. Test profile creation/update
6. Test logout
7. Test admin features

## 📋 Migration Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Test MongoDB connection
- [ ] Update signup component
- [ ] Update login component
- [ ] Update navbar components
- [ ] Update admin panel
- [ ] Migrate reviews API
- [ ] Test all auth flows
- [ ] Test profile management
- [ ] Migrate drug/chemical data (if needed)
- [ ] Remove Supabase dependencies
- [ ] Update documentation

## 🔒 Security Improvements

MongoDB migration includes these security enhancements:

1. **Email Verification Required** - Users must verify email before profile creation
2. **Secure Password Hashing** - Bcrypt with 12 salt rounds
3. **JWT Tokens** - Secure session management
4. **HTTP-Only Cookies** - Prevents XSS attacks
5. **Session Expiry** - Auto-delete expired sessions
6. **Role-Based Access Control** - Admin/superadmin middleware

## 🎯 Benefits

1. **No Vendor Lock-in** - Self-hosted or any cloud provider
2. **Better Performance** - Optimized for your specific queries
3. **Flexible Schema** - Easy to modify without migrations
4. **Cost Effective** - Free tier on MongoDB Atlas
5. **Better Control** - Full control over data and security
6. **Scalability** - Easy horizontal scaling

## 📚 Additional Resources

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Mongoose Docs: https://mongoosejs.com/
- JWT Best Practices: https://jwt.io/introduction
- Brevo API Docs: https://developers.brevo.com/

## 🆘 Need Help?

If you encounter issues:

1. Check MongoDB connection string format
2. Verify environment variables are loaded
3. Check console for error messages
4. Ensure MongoDB cluster is running
5. Verify Brevo SMTP credentials

## 🗑️ Removing Supabase

After successful migration:

1. Remove Supabase package: `pnpm remove @supabase/supabase-js`
2. Delete `lib/supabase.ts`
3. Remove Supabase env vars from `.env.local`
4. Update any remaining references

---

**Ready to start?** Follow Step 1 to set up MongoDB Atlas!
