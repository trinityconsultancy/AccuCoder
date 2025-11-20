# Vercel Deployment Setup

## ✅ Build Fix Applied

The code has been updated to handle missing environment variables gracefully during build.

## 🚀 Next Steps: Add Environment Variables in Vercel

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/trinityconsultancy/accucoder/settings/environment-variables

### 2. Add Required Environment Variables

#### For Supabase (Required for reviews and database features):

**Variable Name:** `NEXT_PUBLIC_SUPABASE_URL`
**Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
**Where to find:** Supabase Dashboard → Project Settings → API → Project URL

**Variable Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Value:** Your Supabase anonymous/public key
**Where to find:** Supabase Dashboard → Project Settings → API → anon/public key

**Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** Your Supabase service role key (for admin operations)
**Where to find:** Supabase Dashboard → Project Settings → API → service_role key (⚠️ Keep this secret!)

#### For Email System (Optional - only if using email features):

**Variable Name:** `SMTP_HOST`
**Value:** `smtp.gmail.com` (or your email provider)

**Variable Name:** `SMTP_PORT`
**Value:** `587`

**Variable Name:** `SMTP_USER`
**Value:** Your email address (e.g., `accucoder.app@gmail.com`)

**Variable Name:** `SMTP_PASSWORD`
**Value:** Your app password (not regular password)

**Variable Name:** `NEXT_PUBLIC_APP_URL`
**Value:** `https://accucoder.vercel.app` (your Vercel deployment URL)

### 3. Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click on the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Check "Use existing Build Cache"
5. Click "Redeploy"

OR the deployment will automatically trigger when you push the fix (already done).

## 🔍 What Was Fixed

### Before:
- Build failed with: `Error: supabaseKey is required.`
- Hard requirement for env variables during build

### After:
- Build succeeds with placeholder values
- Shows warnings in console when env vars are missing
- App functions properly once env vars are added in Vercel

### Changes Made:
1. **lib/supabase.ts**: Added default placeholder values
2. **lib/email-worker.ts**: Added default placeholder values and warning
3. **.env.example**: Created template for required environment variables

## ⚠️ Important Notes

### App Will Work Without Env Vars But...
- ✅ Static pages will load
- ❌ Review submission won't work (needs Supabase)
- ❌ Email features won't work (needs SMTP)
- ❌ Admin dashboard won't work (needs Supabase)

### After Adding Env Vars:
- ✅ All features will work
- ✅ Review submission functional
- ✅ Database operations functional
- ✅ Email system functional (if configured)

## 📝 Quick Supabase Setup

If you don't have Supabase set up yet:

1. Go to https://supabase.com
2. Create new project (free tier available)
3. Wait for project to be created (~2 minutes)
4. Go to Project Settings → API
5. Copy the URL and keys
6. Run the SQL from `supabase/schema.sql` in SQL Editor
7. Add the credentials to Vercel environment variables

## ✅ Verification

Once deployed with env vars:
1. Visit your site: https://accucoder.vercel.app
2. Scroll to testimonials section
3. Click "Share Your Experience"
4. Submit a test review
5. Check Supabase dashboard → Table Editor → user_reviews

## 🆘 Troubleshooting

### Build still failing?
- Check Vercel build logs
- Ensure all env variable names match exactly (case-sensitive)
- Try clearing build cache and redeploying

### Features not working after deployment?
- Verify environment variables are set correctly in Vercel
- Check browser console for errors
- Verify Supabase SQL schema was executed

### Need help?
- Email: accucoder.app@gmail.com
- Check logs: Vercel Dashboard → Deployments → [Latest] → Build Logs
