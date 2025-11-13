# Fix: Email Rate Limit Exceeded Error

## Problem
You're seeing this error during signup:
```
Failed to send magic link: email rate limit exceeded
```

This happens because Supabase tries to send a confirmation email to every new user by default, and you've hit the rate limit (usually 3-4 emails per hour in development).

## Solution: Disable Email Confirmation (For Demo/Development)

### Option 1: Disable in Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/mzuwgfdyfgihqiszujvz

2. Navigate to: **Authentication** → **Providers** → **Email**

3. Find the setting: **"Confirm email"**

4. **Toggle it OFF** (disable email confirmation)

5. Click **Save**

Now users can signup without needing to verify their email!

### Option 2: Wait for Rate Limit to Reset

The rate limit typically resets after 1 hour. You can:
- Wait 1 hour and try again
- Use a different email address
- Use an existing account to login

### Option 3: Use Existing Account

You already have an account created:
- Email: `Rohitpekhale690@gmail.com`
- Role: Superadmin

Just use the **Login** page instead of creating a new account.

---

## For Production

In production, you'll want to:
1. **Enable email confirmation** for security
2. **Configure email templates** to match your branding
3. **Set up custom SMTP** (not Supabase's default) to avoid rate limits:
   - Use SendGrid, AWS SES, Mailgun, etc.
   - Configure in: Authentication → Settings → SMTP Settings

---

## Quick Fix Applied

I've updated the code to handle this better, but the **best solution** is to disable email confirmation in Supabase dashboard as shown above.

---

## Testing After Fix

1. Go to Supabase Dashboard
2. Disable "Confirm email" setting
3. Try signup again with a new email
4. Should work instantly without email verification!

---

*Note: This is for development/demo purposes. For production, keep email verification enabled and use custom SMTP.*
