# 📧 Email Worker System - Complete Documentation

## 🎉 Overview

A complete, production-ready email system with:
- **Queue Management** - Reliable email delivery with retry logic
- **Background Processing** - Non-blocking email sending
- **Multiple Templates** - Pre-built email templates
- **Admin Interface** - Full control from admin panel
- **API Endpoints** - Programmatic email sending
- **Status Tracking** - Monitor all email deliveries

---

## 🚀 Components

### 1. **Email Worker** (`lib/email-worker.ts`)
Background service that processes email queue with automatic retries.

**Features:**
- ✅ Automatic retry with exponential backoff
- ✅ Concurrent email processing (5 at a time)
- ✅ Template system with placeholders
- ✅ HTML email generation
- ✅ Status tracking (pending, sending, sent, failed)
- ✅ Error handling and logging

### 2. **Database Table** (`email_queue`)
Stores all emails with full tracking.

**Columns:**
- `id` - Unique identifier
- `to` - Recipient email
- `subject` - Email subject
- `message` - Email body
- `template` - Template name (optional)
- `template_data` - JSON data for templates
- `status` - Current status
- `attempts` - Retry count
- `max_attempts` - Max retries (default: 3)
- `scheduled_for` - When to send
- `sent_at` - When sent
- `error` - Error message if failed
- `created_at`, `updated_at` - Timestamps

### 3. **API Endpoints**

#### **POST /api/send-email**
Queue an email for sending.

```typescript
Request:
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "message": "Welcome to AccuCoder",
  "template": "welcome", // optional
  "template_data": {...}, // optional
  "scheduled_for": "2025-11-15T10:00:00Z" // optional
}

Response:
{
  "success": true,
  "message": "Email queued successfully",
  "email_id": "uuid"
}
```

#### **GET /api/send-email**
Get email queue status.

```typescript
Query params:
- status: 'pending' | 'sent' | 'failed'
- limit: number (default: 50)

Response:
{
  "success": true,
  "emails": [...],
  "count": 10
}
```

#### **POST /api/email-worker**
Start the email worker.

#### **DELETE /api/email-worker**
Stop the email worker.

### 4. **Admin Panel Tab**
Full email queue management interface.

**Features:**
- Worker status and control
- Queue statistics (pending, sent, failed)
- Email list with filtering
- Real-time status updates
- Refresh button

---

## 📝 Email Templates

### Available Templates:

1. **`welcome`** - New user welcome email
   ```typescript
   template_data: {
     firstName: 'John',
     loginUrl: 'https://accucoder.com/login'
   }
   ```

2. **`roleChanged`** - User role update notification
   ```typescript
   template_data: {
     firstName: 'John',
     newRole: 'Admin',
     date: '2025-11-14'
   }
   ```

3. **`passwordReset`** - Password reset link
   ```typescript
   template_data: {
     firstName: 'John',
     resetUrl: 'https://accucoder.com/reset?token=...'
   }
   ```

4. **`accountDeleted`** - Account deletion notification
   ```typescript
   template_data: {
     firstName: 'John'
   }
   ```

5. **`adminNotification`** - General admin message
   ```typescript
   template_data: {
     firstName: 'John',
     message: 'Your custom HTML message here'
   }
   ```

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

Execute in Supabase SQL Editor:
```sql
-- Located at: database/migrations/create_email_queue.sql
-- Creates email_queue table with RLS policies
```

### Step 2: Configure Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional: Email provider API keys
SENDGRID_API_KEY=your_sendgrid_key
AWS_SES_ACCESS_KEY=your_aws_key
```

### Step 3: Integrate Email Provider

Choose your provider and update `lib/email-worker.ts`:

**SendGrid:**
```typescript
npm install @sendgrid/mail

// In sendEmail() method:
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: params.to,
  from: 'noreply@accucoder.com',
  subject: params.subject,
  text: params.text,
  html: params.html
})
```

**AWS SES:**
```typescript
npm install @aws-sdk/client-ses

// In sendEmail() method:
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const client = new SESClient({ region: 'us-east-1' })
await client.send(new SendEmailCommand({
  Source: 'noreply@accucoder.com',
  Destination: { ToAddresses: [params.to] },
  Message: {
    Subject: { Data: params.subject },
    Body: {
      Html: { Data: params.html },
      Text: { Data: params.text }
    }
  }
}))
```

### Step 4: Start Email Worker

**Option A: From Admin Panel**
1. Login as admin/superadmin
2. Go to "Email Queue" tab
3. Click "Start Worker"

**Option B: Programmatically**
```typescript
import { getEmailWorker } from '@/lib/email-worker'

const worker = getEmailWorker()
await worker.start()
```

**Option C: Auto-start on Server Start**

Create `app/api/init/route.ts`:
```typescript
import { getEmailWorker } from '@/lib/email-worker'

export async function GET() {
  const worker = getEmailWorker()
  await worker.start()
  return Response.json({ success: true })
}
```

Call on server startup or use a cron job.

---

## 💻 Usage Examples

### Send Email from Admin Panel

```typescript
// In admin panel user modal
await sendEmailToUser(
  'user@example.com',
  'Welcome to AccuCoder',
  'Your account has been created!'
)
```

### Send Welcome Email on Signup

```typescript
// In app/signup/page.tsx
import { queueEmail } from '@/lib/email-worker'

await queueEmail({
  to: email,
  subject: 'Welcome to AccuCoder!',
  message: '', // Not needed when using template
  template: 'welcome',
  template_data: {
    firstName: formData.firstName,
    loginUrl: `${window.location.origin}/login`
  }
})
```

### Send Role Change Notification

```typescript
// When admin changes user role
await queueEmail({
  to: user.email,
  subject: 'Your Role Has Been Updated',
  message: '',
  template: 'roleChanged',
  template_data: {
    firstName: user.first_name,
    newRole: newRole,
    date: new Date().toLocaleDateString()
  }
})
```

### Schedule Email for Later

```typescript
// Send email tomorrow at 9 AM
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(9, 0, 0, 0)

await queueEmail({
  to: 'user@example.com',
  subject: 'Daily Report',
  message: 'Your daily coding report is ready!',
  scheduled_for: tomorrow
})
```

### Bulk Email to Users

```typescript
// Send email to multiple users
const users = await getActiveUsers()

await Promise.all(
  users.map(user => 
    queueEmail({
      to: user.email,
      subject: 'Important Update',
      message: 'We have an important update for you...',
      template: 'adminNotification',
      template_data: {
        firstName: user.first_name,
        message: '<p>Your custom message here</p>'
      }
    })
  )
)
```

---

## 📊 Admin Panel Features

### Email Queue Tab

**Worker Control:**
- Start/Stop email worker
- View worker status (running/stopped)
- Live status indicator

**Queue Statistics:**
- Pending emails count
- Sent emails count
- Failed emails count

**Email Table:**
- Filter by status
- View recipient, subject, status
- See attempt counts
- Check scheduled time
- Refresh queue

**Actions:**
- Manually refresh queue
- Filter emails by status
- Monitor delivery

---

## 🔐 Security Features

### RLS Policies:
- Only admins/superadmins can view email queue
- System can insert/update emails (for API use)
- Users cannot view other users' emails

### API Protection:
- Optional authentication check
- Admin-only access
- Email validation
- Rate limiting ready

---

## 🎯 Retry Logic

### Exponential Backoff:
- 1st retry: 1 minute delay
- 2nd retry: 2 minutes delay
- 3rd retry: 4 minutes delay
- Max attempts: 3 (configurable)

### Automatic Retry:
- Failed emails automatically re-queued
- Status changes: `pending` → `sending` → `sent/failed`
- Error messages logged for debugging

---

## 📈 Monitoring

### Check Email Status:
```typescript
// Get all pending emails
const response = await fetch('/api/send-email?status=pending')
const data = await response.json()
console.log(`${data.count} emails pending`)
```

### View Failed Emails:
```typescript
// Get failed emails
const response = await fetch('/api/send-email?status=failed')
const data = await response.json()
data.emails.forEach(email => {
  console.log(`Failed: ${email.to} - ${email.error}`)
})
```

### Cleanup Old Emails:
```sql
-- Run in Supabase SQL Editor
SELECT cleanup_old_emails();
-- Deletes emails older than 30 days
```

---

## 🚀 Production Deployment

### 1. **Choose Email Provider:**
- SendGrid (recommended for startups)
- AWS SES (scalable for enterprise)
- Mailgun (developer-friendly)
- Postmark (reliable)

### 2. **Configure Domain:**
- Set up SPF records
- Configure DKIM
- Add DMARC policy
- Verify sender domain

### 3. **Set Up Monitoring:**
- Track delivery rates
- Monitor bounce rates
- Set up alerts for failures
- Log all email activity

### 4. **Optimize Worker:**
```typescript
// Adjust worker settings based on volume
private pollInterval = 5000 // Check every 5 seconds
private maxConcurrent = 5   // Process 5 at a time

// For high volume:
private pollInterval = 1000  // Check every second
private maxConcurrent = 20   // Process 20 at a time
```

### 5. **Auto-start Worker:**
- Use cron job to keep worker running
- Add health check endpoint
- Auto-restart on failure
- Use process manager (PM2)

---

## 📝 Best Practices

1. **Always use templates** for consistent branding
2. **Queue emails** instead of sending directly
3. **Monitor failed emails** regularly
4. **Clean up old emails** to save database space
5. **Test with real email addresses** before production
6. **Set up bounce handling** with your provider
7. **Use personalization** in email content
8. **Include unsubscribe link** for compliance
9. **Respect rate limits** of your email provider
10. **Log all email activities** for audit trail

---

## 🎊 Summary

You now have:
- ✅ Complete email worker system
- ✅ Queue management with retries
- ✅ 5 pre-built email templates
- ✅ Admin panel integration
- ✅ API endpoints for sending
- ✅ Database table with RLS
- ✅ Real-time monitoring
- ✅ Production-ready architecture
- ✅ Full documentation

**Ready to send emails like a pro! 📧**

---

*Last Updated: November 14, 2025*
*Version: 1.0.0*
*Built with ❤️ for AccuCoder*
