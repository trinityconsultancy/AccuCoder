# MongoDB Migration Plan

## Collections Structure

### 1. users
```javascript
{
  _id: ObjectId,
  email: String (unique, required, indexed),
  password: String (hashed with bcrypt),
  emailVerified: Boolean (default: false),
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,
  role: String (enum: ['user', 'admin', 'superadmin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. profiles
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', unique, required, indexed),
  firstName: String (required),
  lastName: String (required),
  certificationBody: String (enum: ['AAPC', 'AHIMA'], required),
  certificationTitle: String (required),
  aapcId: String,
  ahimaId: String,
  organization: String,
  position: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. sessions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required, indexed),
  token: String (unique, required, indexed),
  expiresAt: Date (required, indexed),
  rememberMe: Boolean (default: false),
  createdAt: Date
}
```

### 4. drugChemicals
```javascript
{
  _id: ObjectId,
  substance: String (required, indexed),
  poisoningAccidentalUnintentional: String,
  poisoningIntentionalSelfHarm: String,
  poisoningAssault: String,
  poisoningUndetermined: String,
  adverseEffect: String,
  underdosing: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. reviews
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  role: String (required),
  location: String (required),
  country: String (required),
  rating: Number (min: 1, max: 5, required),
  comment: String (required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. alphabeticalIndex
```javascript
{
  _id: ObjectId,
  term: String (required, indexed),
  code: String,
  reference: String,
  seeAlso: String,
  type: String (required),
  indentLevel: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Migration Steps

1. **Install Dependencies**
   - mongoose
   - bcryptjs
   - jsonwebtoken
   - nodemailer (or brevo SDK)

2. **Environment Variables**
   - MONGODB_URI
   - JWT_SECRET
   - EMAIL_SERVICE credentials
   - NEXT_PUBLIC_APP_URL

3. **Create MongoDB Connection**
   - lib/mongodb.ts - Connection singleton

4. **Create Mongoose Models**
   - lib/models/User.ts
   - lib/models/Profile.ts
   - lib/models/Session.ts
   - lib/models/DrugChemical.ts
   - lib/models/Review.ts
   - lib/models/AlphabeticalIndex.ts

5. **Auth Utilities**
   - lib/auth/jwt.ts - Token generation/verification
   - lib/auth/password.ts - Bcrypt hashing
   - lib/auth/middleware.ts - Auth middleware for API routes

6. **Email Service**
   - lib/email/brevo.ts - Brevo integration
   - lib/email/templates.ts - Email templates

7. **API Routes**
   - app/api/auth/signup/route.ts
   - app/api/auth/login/route.ts
   - app/api/auth/logout/route.ts
   - app/api/auth/verify-email/route.ts
   - app/api/auth/reset-password/route.ts
   - app/api/auth/session/route.ts
   - app/api/users/profile/route.ts
   - app/api/reviews/route.ts (update)

8. **Frontend Updates**
   - Replace Supabase client calls with fetch/API calls
   - Update session management
   - Update auth state handling

## Benefits of MongoDB

1. **Flexible Schema** - Easy to modify structure without migrations
2. **Better Performance** - Optimized for document-based queries
3. **Scalability** - Better horizontal scaling
4. **No Vendor Lock-in** - Can host anywhere
5. **Rich Queries** - Powerful aggregation pipeline
6. **Cost Effective** - Free tier on MongoDB Atlas
