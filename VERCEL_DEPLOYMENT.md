# Vercel Deployment Guide for AccuCoder

## Environment Variables Required

You need to add these environment variables in your Vercel project settings:

### Supabase Configuration
1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Groq AI Configuration (for AccuBot)
3. `GROQ_API_KEY` - Your primary Groq API key
4. `GROQ_API_KEY_2` - Your second Groq API key
5. `GROQ_API_KEY_3` - Your third Groq API key

---

## How to Add Environment Variables in Vercel

### Method 1: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your AccuCoder project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

### Method 2: Via Vercel CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Then paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Then paste your Supabase anon key when prompted

vercel env add GROQ_API_KEY production
# Then paste your Groq API key when prompted

vercel env add GROQ_API_KEY_2 production
vercel env add GROQ_API_KEY_3 production
```

---

## Get Your Values from .env.local

Your current values are in `.env.local` file. Copy them from there:

```bash
# View your current environment variables
Get-Content .env.local
```

---

## After Adding Environment Variables

1. **Redeploy**: After adding all environment variables, trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

2. **Or** click **Redeploy** button in Vercel Dashboard

---

## Important Notes

⚠️ **Do NOT commit `.env.local` to Git** - It contains sensitive keys
✅ `.env.local` is already in `.gitignore`
✅ Environment variables are encrypted in Vercel

---

## Verification

After deployment succeeds:
1. Visit your Vercel URL
2. Check that data loads on `/index` and `/table/drugs` pages
3. Test AccuBot chatbot
4. Verify all features work

---

## Troubleshooting

### If you get 404: NOT_FOUND error:
This usually means the deployment hasn't been triggered or environment variables are missing.

**Solution:**
1. **Add ALL environment variables** in Vercel (see above)
2. **Go to Vercel Dashboard** → Your Project → Deployments
3. **Find the failed deployment** → Click ⋯ menu → **Redeploy**
4. **Wait for build to complete** (check build logs for errors)
5. **Alternative**: Push a new commit to trigger auto-deployment:
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push
   ```

### If build still fails:
1. Check that ALL environment variables are added:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY` (minimum required)
   - `GROQ_API_KEY_2` (optional)
   - `GROQ_API_KEY_3` (optional)
2. Make sure variable names are EXACT (case-sensitive)
3. No extra spaces in values
4. Check build logs in Vercel for specific errors
5. Verify `vercel.json` is in the repository

### If data doesn't load after successful deployment:
1. Check Supabase RLS policies are set correctly
2. Verify Supabase URL and key are correct
3. Check browser console for errors
4. Test Supabase connection from browser console:
   ```javascript
   // Open browser console on your deployed site
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

### If AccuBot doesn't work:
1. Verify all 3 Groq API keys are valid
2. Check API key limits haven't been exceeded
3. Test with just one API key first
4. Check API route is accessible: `https://your-site.vercel.app/api/chat`

### Common Vercel Deployment Issues:

**"Command failed with exit code 1"**
- Missing environment variables
- Add them and redeploy

**"Module not found"**
- Run `pnpm install` locally to verify dependencies
- Check `package.json` is correct

**"Build exceeded maximum duration"**
- Large CSV files in repository might cause timeout
- Consider using `.vercelignore` to exclude large data files
