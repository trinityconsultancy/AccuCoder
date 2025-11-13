# Configure Supabase to Send OTP Codes Instead of Magic Links

## Steps to Enable OTP Codes in Supabase:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Email Templates"

3. **Configure OTP Settings**
   - Go to "Settings" → "Authentication"
   - Scroll to "Email Auth"
   - Look for "Email OTP" settings
   - Enable "Use OTP instead of magic link"

4. **Alternative: Update Email Template**
   - Go to "Email Templates" → "Magic Link"
   - You can customize to show the OTP token instead

5. **Or Use Phone OTP Instead**
   - Supabase phone auth sends actual numeric codes
   - But requires phone number setup

## Current Workaround:

Since Supabase email OTP defaults to magic links, here are options:

### Option 1: Enable Phone Authentication
- Add phone number field to signup
- Use SMS OTP (6-digit codes)

### Option 2: Skip OTP for Now
- Just use password authentication
- Add 2FA later with authenticator apps

### Option 3: Use Magic Link
- Accept the magic link email
- Users click link instead of entering code

## Recommended Solution:

For production, use **Authenticator App (TOTP)**:
- More secure than email OTP
- Generates 6-digit codes
- Works offline
- Industry standard (Google Authenticator, Authy, etc.)
