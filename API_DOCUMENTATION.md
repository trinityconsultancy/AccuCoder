# AccuCoder API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://accucoder.vercel.app`

## Authentication

All authenticated endpoints require a valid JWT token stored in an HTTP-only cookie named `auth-token`.

### Headers
\`\`\`
Cookie: auth-token=your-jwt-token
\`\`\`

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window | Block Duration |
|--------------|-------|--------|----------------|
| Authentication | 5 requests | 15 minutes | 1 hour |
| Standard API | 60 requests | 1 minute | 5 minutes |
| AI Chat | 10 requests | 1 minute | 2 minutes |
| Email | 3 requests | 1 hour | 24 hours |

Rate limit headers are included in all responses:
\`\`\`
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 2025-01-01T00:01:00.000Z
\`\`\`

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "certificationBody": "AAPC",
  "certificationTitle": "CPC",
  "aapcId": "A12345",
  "ahimaId": "",
  "organization": "Hospital ABC",
  "position": "Medical Coder"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "userId": "64abc123def456789"
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Missing or invalid fields
- `409 CONFLICT_ERROR`: Email already exists

---

### Login

Authenticate and create a session.

**Endpoint:** `POST /api/auth/login`  
**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "64abc123def456789",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

Sets HTTP-only cookie:
\`\`\`
Set-Cookie: auth-token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Missing email or password
- `401 AUTHENTICATION_ERROR`: Invalid credentials
- `403 AUTHORIZATION_ERROR`: Email not verified
- `429 RATE_LIMIT_ERROR`: Too many login attempts

---

### Get Session

Retrieve current authenticated user.

**Endpoint:** `GET /api/auth/session`  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "user": {
    "id": "64abc123def456789",
    "email": "user@example.com",
    "role": "user"
  },
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "certificationBody": "AAPC",
    "certificationTitle": "CPC",
    "aapcId": "A12345",
    "organization": "Hospital ABC"
  }
}
\`\`\`

**Errors:**
- `401 AUTHENTICATION_ERROR`: Not logged in or invalid token

---

### Logout

End current session.

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

Clears auth cookie:
\`\`\`
Set-Cookie: auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
\`\`\`

---

### Verify Email

Verify user email address.

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
\`\`\`json
{
  "token": "abc123def456..."
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Email verified successfully"
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Missing or invalid token
- `404 NOT_FOUND`: Token not found or expired

---

## Review Endpoints

### Get Reviews

Retrieve reviews with optional filtering.

**Endpoint:** `GET /api/reviews`

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `approved`, `rejected`, or `all`
  - Default: `approved` for public, `all` for admins

**Example:**
\`\`\`
GET /api/reviews?status=approved
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "reviews": [
    {
      "_id": "64abc123def456789",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "Medical Coder",
      "location": "New York",
      "country": "USA",
      "rating": 5,
      "comment": "Excellent platform for medical coding!",
      "status": "approved",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-02T00:00:00.000Z"
    }
  ]
}
\`\`\`

---

### Create Review

Submit a new review.

**Endpoint:** `POST /api/reviews`  
**Rate Limit:** 60 requests per minute

**Request Body:**
\`\`\`json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "Medical Coder",
  "location": "New York",
  "country": "USA",
  "rating": 5,
  "comment": "Excellent platform for medical coding!"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "_id": "64abc123def456789",
    "name": "Jane Smith",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Missing or invalid fields
- `429 RATE_LIMIT_ERROR`: Too many requests

---

### Update Review Status

Approve, reject, or modify review status (Admin only).

**Endpoint:** `PATCH /api/reviews/[id]`  
**Authentication:** Required (Admin)

**Request Body:**
\`\`\`json
{
  "status": "approved"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Review approved successfully",
  "review": {
    "_id": "64abc123def456789",
    "status": "approved",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Invalid status value
- `401 AUTHENTICATION_ERROR`: Not logged in
- `403 AUTHORIZATION_ERROR`: Not an admin
- `404 NOT_FOUND`: Review not found

---

### Delete Review

Permanently delete a review (Admin only).

**Endpoint:** `DELETE /api/reviews/[id]`  
**Authentication:** Required (Admin)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Review deleted successfully"
}
\`\`\`

**Errors:**
- `401 AUTHENTICATION_ERROR`: Not logged in
- `403 AUTHORIZATION_ERROR`: Not an admin
- `404 NOT_FOUND`: Review not found

---

## Drug Code Endpoints

### Search Drug Codes

Search ICD-10-CM drug and chemical poisoning codes.

**Endpoint:** `GET /api/drugs`

**Query Parameters:**
- `query` (required): Search term
- `limit` (optional): Max results (default: 20, max: 100)

**Example:**
\`\`\`
GET /api/drugs?query=aspirin&limit=10
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "results": [
    {
      "_id": "64abc123def456789",
      "substance": "Aspirin",
      "poisoningAccidentalUnintentional": "T39.011",
      "poisoningIntentionalSelfHarm": "T39.012",
      "poisoningAssault": "T39.013",
      "poisoningUndetermined": "T39.014",
      "adverseEffect": "T39.015",
      "underdosing": "T39.016"
    }
  ],
  "count": 1,
  "query": "aspirin"
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Missing query parameter
- `429 RATE_LIMIT_ERROR`: Too many requests

---

## AI Chat Endpoint

### Chat with AI Assistant

Get AI-powered medical coding assistance.

**Endpoint:** `POST /api/chat`  
**Rate Limit:** 10 requests per minute  
**Authentication:** Recommended

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the ICD-10 code for Type 2 diabetes with neuropathy?"
    }
  ]
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "message": "The ICD-10-CM code for Type 2 diabetes mellitus with diabetic neuropathy is E11.40...",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "context": {
    "relatedCodes": ["E11.40", "E11.41", "E11.42"]
  }
}
\`\`\`

**Errors:**
- `400 VALIDATION_ERROR`: Invalid message format
- `429 RATE_LIMIT_ERROR`: Too many requests
- `500 INTERNAL_ERROR`: AI service unavailable

---

## User Profile Endpoint

### Get User Profile

Retrieve authenticated user's profile.

**Endpoint:** `GET /api/users/profile`  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "profile": {
    "_id": "64abc123def456789",
    "firstName": "John",
    "lastName": "Doe",
    "certificationBody": "AAPC",
    "certificationTitle": "CPC",
    "aapcId": "A12345",
    "ahimaId": null,
    "organization": "Hospital ABC",
    "position": "Medical Coder",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

**Errors:**
- `401 AUTHENTICATION_ERROR`: Not logged in
- `404 NOT_FOUND`: Profile not found

---

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Authentication required |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT_ERROR` | 409 | Duplicate entry |
| `RATE_LIMIT_ERROR` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Rate Limit Response

When rate limit is exceeded:

**Response (429 Too Many Requests):**
\`\`\`json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_ERROR",
  "message": "You have exceeded the rate limit. Please try again later.",
  "resetAt": "2025-01-01T00:15:00.000Z",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
\`\`\`

**Headers:**
\`\`\`
Retry-After: 900
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-01-01T00:15:00.000Z
\`\`\`

---

## Webhook Support (Coming Soon)

Future versions will support webhooks for:
- Review status changes
- User registration events
- Email verification events

---

## API Versioning

Current API version: **v1** (default, no prefix required)

Future versions will use URL prefix:
- `https://accucoder.com/api/v2/...`

---

## Need Help?

- **Documentation**: [README.md](../README.md)
- **GitHub Issues**: [github.com/trinityconsultancy/AccuCoder/issues](https://github.com/trinityconsultancy/AccuCoder/issues)
- **Email**: support@accucoder.com

---

**Last Updated**: December 2025
