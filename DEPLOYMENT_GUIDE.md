# AccuCoder - Complete Deployment Guide with SSL

**Domain**: accucoder.app  
**Registrar**: name.com  
**Recommended Platform**: Vercel (automatic SSL)

---

## 🚀 Quick Start - Vercel Deployment (Recommended)

### **Why Vercel?**
- ✅ **Free SSL certificates** (Let's Encrypt) - automatic provisioning & renewal
- ✅ **Zero configuration** - SSL works out of the box
- ✅ **Global CDN** - Fast worldwide
- ✅ **Automatic deployments** from Git
- ✅ **Perfect for Next.js** - Built by the Next.js team
- ✅ **Free tier available** - Generous limits

---

## 📋 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Commit all changes**
   ```bash
   git add .
   git commit -m "Production ready with SSL configuration"
   git push origin main
   ```

2. **Verify environment variables are NOT in git**
   ```bash
   # .env.local should be in .gitignore
   cat .gitignore | grep .env.local
   ```

---

### **Step 2: Deploy to Vercel**

#### **Option A: Via Vercel Dashboard (Easiest)**

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/login with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository: `trinityconsultancy/AccuCoder`
   - Click "Import"

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: pnpm build
   Install Command: pnpm install
   Output Directory: .next
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following (get values from your `.env.local`):
   
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key-here
   GROQ_API_KEY=gsk_...
   GROQ_API_KEY_2=gsk_... (optional)
   GROQ_API_KEY_3=gsk_... (optional)
   BREVO_API_KEY=xkeysib-...
   BREVO_SENDER_EMAIL=noreply@accucoder.app
   BREVO_SENDER_NAME=AccuCoder
   NEXT_PUBLIC_APP_URL=https://accucoder.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - You'll get a temporary URL: `accucoder.vercel.app`

#### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

---

### **Step 3: Configure Custom Domain (accucoder.app)**

#### **In Vercel Dashboard**

1. **Go to Project Settings**
   - Open your AccuCoder project
   - Go to Settings → Domains

2. **Add Domain**
   - Enter: `accucoder.app`
   - Click "Add"
   - Vercel will show DNS configuration needed

3. **Add www subdomain (optional)**
   - Enter: `www.accucoder.app`
   - Click "Add"
   - Configure to redirect to main domain

---

### **Step 4: Configure DNS at name.com**

1. **Login to name.com**
   - Go to https://www.name.com
   - Login to your account

2. **Access Domain Manager**
   - Click "My Account" → "Domain Manager"
   - Find `accucoder.app`
   - Click "Manage"

3. **Update DNS Records**
   - Click "DNS Records" tab
   - **Delete any existing A/CNAME records for @ and www**
   
4. **Add Vercel DNS Records**
   
   Vercel will show you one of these configurations:

   **Configuration A** (A Records):
   ```
   Type    Host/Name    Value/Answer       TTL
   A       @            76.76.21.21        300
   A       www          76.76.21.21        300
   ```

   **Configuration B** (CNAME):
   ```
   Type    Host/Name    Value/Answer                  TTL
   CNAME   @            cname.vercel-dns.com.        300
   CNAME   www          cname.vercel-dns.com.        300
   ```
   
   **Note**: Use the exact records Vercel provides in your dashboard!

5. **Save DNS Changes**
   - Click "Add Record" for each
   - Wait for propagation (5-60 minutes)

---

### **Step 5: SSL Certificate Provisioning**

#### **Automatic Process**

1. **Vercel automatically:**
   - Detects your custom domain
   - Provisions Let's Encrypt SSL certificate
   - Configures HTTPS
   - Sets up HTTP → HTTPS redirect
   - Enables HSTS (HTTP Strict Transport Security)

2. **Timeline**
   - DNS propagation: 5-60 minutes
   - SSL provisioning: 1-5 minutes after DNS
   - Total: Usually 10-60 minutes

3. **Verify SSL is Active**
   - Go to Vercel Dashboard → Domains
   - You'll see: ✅ "SSL Certificate: Active"
   - Certificate auto-renews every 90 days

---

### **Step 6: Test Your Deployment**

#### **1. Test HTTP → HTTPS Redirect**
```bash
# Should automatically redirect to HTTPS
curl -I http://accucoder.app
# Look for: Location: https://accucoder.app
```

#### **2. Test HTTPS**
```bash
# Should return 200 OK
curl -I https://accucoder.app
```

#### **3. Test SSL Certificate**
```bash
# Check SSL certificate details
openssl s_client -connect accucoder.app:443 -servername accucoder.app
```

Or use online tools:
- https://www.ssllabs.com/ssltest/analyze.html?d=accucoder.app
- https://www.whynopadlock.com

#### **4. Test Security Headers**
```bash
curl -I https://accucoder.app
# Should see:
# Strict-Transport-Security: max-age=63072000
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
```

#### **5. Test Application**
- Visit https://accucoder.app
- Test login/signup
- Test AI chat
- Test drug search
- Test review submission
- Check browser console for errors

---

## 🔒 SSL Certificate Details

### **Certificate Information**

```
Issuer: Let's Encrypt
Type: Domain Validation (DV)
Encryption: RSA 2048-bit or ECDSA 256-bit
Validity: 90 days
Auto-renewal: Yes (Vercel handles this)
Wildcard: No (specific domain)
```

### **Security Features**

- ✅ **TLS 1.3** - Latest protocol version
- ✅ **Perfect Forward Secrecy** (PFS)
- ✅ **Strong cipher suites** only
- ✅ **HSTS preload** ready
- ✅ **OCSP stapling** for performance
- ✅ **A+ SSL Labs rating** (typically)

### **What Vercel Provides**

1. **Automatic SSL Provisioning**
   - Certificate requested from Let's Encrypt
   - Domain validation via DNS
   - Certificate installed on edge network

2. **Automatic Renewal**
   - Renews 30 days before expiry
   - Zero downtime during renewal
   - Email notifications if issues

3. **Global Edge Network**
   - SSL termination at edge (faster)
   - Certificate cached globally
   - Reduced latency

---

## 🔧 Environment Variables for Production

### **Required Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accucoder?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-256-bit-secret-key-here

# AI Service (Groq)
GROQ_API_KEY=gsk_your_primary_api_key_here
GROQ_API_KEY_2=gsk_your_backup_api_key_here   # Optional but recommended
GROQ_API_KEY_3=gsk_your_tertiary_api_key_here # Optional

# Email Service (Brevo)
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_SENDER_EMAIL=noreply@accucoder.app
BREVO_SENDER_NAME=AccuCoder

# Application URL
NEXT_PUBLIC_APP_URL=https://accucoder.app
```

### **Generate Secure JWT Secret**

```bash
# Generate a secure 256-bit secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 DNS Configuration Summary

### **Final DNS Records at name.com**

```
Type    Host    Value                        TTL     Purpose
------  ------  ---------------------------  ------  ------------------
A       @       76.76.21.21                 300     Main domain
A       www     76.76.21.21                 300     WWW subdomain
```

**OR** (depending on Vercel's instructions):

```
Type    Host    Value                        TTL     Purpose
------  ------  ---------------------------  ------  ------------------
CNAME   @       cname.vercel-dns.com.       300     Main domain
CNAME   www     cname.vercel-dns.com.       300     WWW redirect
```

### **Optional Records**

```
Type    Host    Value                        TTL     Purpose
------  ------  ---------------------------  ------  ------------------
TXT     @       v=spf1 include:...          300     Email SPF
MX      @       mail.accucoder.app          300     Email (if needed)
```

---

## 📊 Post-Deployment Checklist

### **Immediate Checks** (0-60 minutes)

- [ ] DNS propagation complete (check: https://dnschecker.org)
- [ ] SSL certificate active (https://accucoder.app shows padlock)
- [ ] HTTP redirects to HTTPS
- [ ] www redirects to non-www (or vice versa)
- [ ] All pages load correctly
- [ ] API routes working
- [ ] Database connections working
- [ ] Email verification working
- [ ] AI chat working
- [ ] No console errors

### **Security Checks** (1-24 hours)

- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/
  - Target: A+ rating
- [ ] Security headers present (check browser dev tools)
- [ ] HSTS header active
- [ ] No mixed content warnings
- [ ] CSP violations resolved
- [ ] XSS protection headers active

### **Performance Checks**

- [ ] PageSpeed Insights: https://pagespeed.web.dev
  - Target: >90 score
- [ ] GTmetrix: https://gtmetrix.com
- [ ] WebPageTest: https://www.webpagetest.org
- [ ] Lighthouse audit (Chrome DevTools)

### **Functionality Checks**

- [ ] User signup working
- [ ] Email verification sent
- [ ] Login working
- [ ] JWT tokens valid
- [ ] Session management working
- [ ] Review submission working
- [ ] Drug search working
- [ ] AI chat responding
- [ ] Admin panel accessible
- [ ] All API endpoints responding

---

## 🔄 Continuous Deployment

### **Automatic Deployments**

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Updates accucoder.app
```

### **Preview Deployments**

For branches/PRs:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel creates preview URL: accucoder-pr-123.vercel.app
```

---

## 🆘 Troubleshooting

### **SSL Certificate Not Provisioning**

**Issue**: "SSL certificate pending" for more than 1 hour

**Solutions**:
1. Verify DNS records are correct (check dnschecker.org)
2. Ensure no CAA records blocking Let's Encrypt
3. Remove any existing SSL certificates at name.com
4. Contact Vercel support (support@vercel.com)

### **DNS Not Propagating**

**Issue**: Domain not resolving after 1+ hour

**Solutions**:
1. Check nameservers: `nslookup accucoder.app`
2. Flush DNS cache: `ipconfig /flushdns` (Windows)
3. Try different DNS: `nslookup accucoder.app 8.8.8.8`
4. Wait up to 48 hours (rare)

### **Mixed Content Warnings**

**Issue**: HTTPS page loading HTTP resources

**Solutions**:
1. Check browser console for warnings
2. Update all URLs to use `https://`
3. Use protocol-relative URLs: `//example.com/image.jpg`
4. Set `Content-Security-Policy` header

### **Environment Variables Not Working**

**Issue**: App crashes or features not working

**Solutions**:
1. Verify all required env vars in Vercel
2. Redeploy after adding env vars
3. Check for typos in variable names
4. Ensure no quotes around values in Vercel UI

---

## 📈 Monitoring & Maintenance

### **Monitoring Tools**

1. **Vercel Analytics** (built-in)
   - Real-time traffic
   - Performance metrics
   - Error tracking

2. **Uptime Monitoring**
   - https://uptimerobot.com (free)
   - https://www.pingdom.com
   - Check https://accucoder.app every 5 minutes

3. **SSL Monitoring**
   - https://www.ssllabs.com/ssltest/ (monthly)
   - Certificate expiry alerts (Vercel handles)

4. **Error Tracking**
   - Sentry.io (optional)
   - LogRocket (optional)
   - Vercel logs (built-in)

### **Regular Maintenance**

- [ ] Monthly: Check SSL Labs score
- [ ] Monthly: Review Vercel analytics
- [ ] Monthly: Test all critical features
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance optimization

---

## 🎯 Production Optimization

### **Performance**

```javascript
// next.config.mjs already includes:
- Image optimization
- Security headers
- HSTS preload
- Automatic static optimization
```

### **Security**

- ✅ HTTPS enforced
- ✅ HSTS with preload
- ✅ Security headers configured
- ✅ XSS protection
- ✅ CSRF protection (built-in)
- ✅ Rate limiting ready

### **SEO**

Add to your site:
- [ ] `robots.txt`
- [ ] `sitemap.xml`
- [ ] Meta tags
- [ ] Open Graph tags
- [ ] Structured data

---

## 💰 Cost Estimate

### **Vercel Pricing**

**Hobby Plan** (Free):
- SSL certificate: ✅ Free
- Bandwidth: 100GB/month
- Builds: Unlimited
- Perfect for getting started

**Pro Plan** ($20/month):
- SSL certificate: ✅ Free
- Bandwidth: 1TB/month
- Better performance
- Priority support

### **name.com Domain**

- Domain registration: ~$15/year
- DNS hosting: Included
- SSL certificate: Not needed (Vercel provides)

### **Total Cost**

- **Year 1**: $15 (domain) + $0-240 (Vercel)
- **Ongoing**: $15/year (domain) + $0-240/year (Vercel)

---

## ✅ Deployment Complete!

Once deployed, your site will have:

- ✅ **accucoder.app** - Production URL
- ✅ **HTTPS** - Automatic SSL certificate
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto-renewal** - No SSL maintenance
- ✅ **Security headers** - A+ security rating
- ✅ **Continuous deployment** - Auto-deploy on git push
- ✅ **99.99% uptime** - Vercel SLA

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com
- **name.com Support**: https://www.name.com/support
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **SSL Labs**: https://www.ssllabs.com/ssltest/

---

*Last Updated: December 2024*  
*Next.js 16.0.0 | Vercel | Let's Encrypt SSL*
