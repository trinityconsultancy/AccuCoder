# AccuCoder Deployment Checklist

**Domain**: accucoder.app  
**Platform**: Vercel (Recommended)  
**SSL**: Let's Encrypt (Automatic)

---

## 📋 Pre-Deployment Checklist

### **Code & Configuration**

- [x] ✅ TypeScript compilation successful (0 errors)
- [x] ✅ Build completes successfully (`pnpm build`)
- [x] ✅ All environment variables documented
- [x] ✅ Security headers configured (`next.config.mjs`)
- [x] ✅ SSL/HTTPS redirects configured
- [x] ✅ API routes validated and tested
- [x] ✅ Database connection working
- [x] ✅ Email service configured (Brevo)
- [x] ✅ AI service configured (Groq)
- [ ] `.env.local` NOT committed to git (verify `.gitignore`)
- [ ] All changes committed to `main` branch

---

## 🚀 Deployment Steps

### **Step 1: Repository Preparation**

- [ ] Commit all changes
  ```bash
  git add .
  git commit -m "Production ready with SSL"
  git push origin main
  ```

- [ ] Verify `.gitignore` includes:
  - [ ] `.env.local`
  - [ ] `.env.production`
  - [ ] `node_modules/`
  - [ ] `.next/`

### **Step 2: Vercel Setup**

- [ ] Create Vercel account (https://vercel.com)
- [ ] Connect GitHub account
- [ ] Import AccuCoder repository
- [ ] Verify framework detection (Next.js)
- [ ] Configure build settings:
  - [ ] Build Command: `pnpm build`
  - [ ] Install Command: `pnpm install`
  - [ ] Output Directory: `.next`

### **Step 3: Environment Variables**

Add these in Vercel → Settings → Environment Variables:

#### **Required Variables**
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Generated 256-bit secret
- [ ] `GROQ_API_KEY` - Primary Groq API key
- [ ] `BREVO_API_KEY` - Brevo SMTP API key
- [ ] `BREVO_SENDER_EMAIL` - Email sender address
- [ ] `BREVO_SENDER_NAME` - Email sender name
- [ ] `NEXT_PUBLIC_APP_URL` - https://accucoder.app

#### **Optional Variables**
- [ ] `GROQ_API_KEY_2` - Backup Groq API key
- [ ] `GROQ_API_KEY_3` - Tertiary Groq API key

#### **Generate JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Step 4: Initial Deployment**

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build (2-5 minutes)
- [ ] Verify deployment successful
- [ ] Test temporary URL: `accucoder.vercel.app`
- [ ] Check all pages load
- [ ] Test API endpoints
- [ ] Verify database connections

### **Step 5: Custom Domain Configuration**

#### **In Vercel Dashboard**
- [ ] Go to Settings → Domains
- [ ] Add domain: `accucoder.app`
- [ ] Add domain: `www.accucoder.app` (optional)
- [ ] Note DNS records provided by Vercel

#### **In name.com Dashboard**
- [ ] Login to name.com
- [ ] Go to Domain Manager → accucoder.app
- [ ] Click "DNS Records"
- [ ] Delete existing A/CNAME records for @ and www
- [ ] Add new records as shown in Vercel:
  - [ ] Type: A, Host: @, Value: `[Vercel IP]`
  - [ ] Type: A, Host: www, Value: `[Vercel IP]`
- [ ] Save DNS changes

### **Step 6: SSL Certificate**

- [ ] Wait 10-60 minutes for DNS propagation
- [ ] Check DNS: https://dnschecker.org/#A/accucoder.app
- [ ] Verify Vercel shows "SSL: Active ✅"
- [ ] Test HTTPS: https://accucoder.app
- [ ] Verify padlock icon shows in browser
- [ ] Test HTTP redirect: http://accucoder.app → https://accucoder.app

---

## ✅ Post-Deployment Verification

### **SSL & Security**

- [ ] **HTTPS Working**
  - [ ] https://accucoder.app loads
  - [ ] Padlock icon visible
  - [ ] Certificate valid (click padlock)

- [ ] **Redirects Working**
  - [ ] http://accucoder.app → https://accucoder.app
  - [ ] www.accucoder.app → accucoder.app

- [ ] **Security Headers**
  - [ ] HSTS header present (check dev tools)
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy present

- [ ] **SSL Test**
  - [ ] SSL Labs: https://www.ssllabs.com/ssltest/
  - [ ] Target: A or A+ rating
  - [ ] No warnings or errors

### **Functionality Tests**

#### **Public Pages**
- [ ] Home page loads
- [ ] About page loads
- [ ] Login page loads
- [ ] Signup page loads
- [ ] Search page loads
- [ ] Learning page loads
- [ ] Converter page loads
- [ ] No console errors

#### **Authentication**
- [ ] User signup works
- [ ] Verification email sent
- [ ] Email verification works
- [ ] User login works
- [ ] JWT token generated
- [ ] Session created
- [ ] Logout works

#### **API Endpoints**
- [ ] `/api/auth/signup` - POST working
- [ ] `/api/auth/login` - POST working
- [ ] `/api/auth/verify-email` - GET working
- [ ] `/api/reviews` - GET working
- [ ] `/api/reviews` - POST working
- [ ] `/api/chat` - POST working
- [ ] `/api/drugs` - GET working
- [ ] `/api/health` - GET working

#### **Database**
- [ ] User creation working
- [ ] Profile creation working
- [ ] Session storage working
- [ ] Review submission working
- [ ] Drug search working
- [ ] ICD code search working

#### **External Services**
- [ ] Email delivery working (Brevo)
- [ ] AI chat responding (Groq)
- [ ] MongoDB connection stable

#### **Admin Features**
- [ ] Admin login works
- [ ] Admin panel accessible
- [ ] Review moderation works
- [ ] User management works

### **Performance**

- [ ] **PageSpeed Insights**
  - [ ] Visit: https://pagespeed.web.dev
  - [ ] Test: https://accucoder.app
  - [ ] Target: >80 score

- [ ] **Load Times**
  - [ ] Home page: <2 seconds
  - [ ] Search page: <3 seconds
  - [ ] API responses: <500ms (avg)

- [ ] **Caching**
  - [ ] Static assets cached
  - [ ] API responses cached (where applicable)
  - [ ] CDN delivering content

### **Browser Compatibility**

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### **Mobile Responsiveness**

- [ ] Home page responsive
- [ ] Search page responsive
- [ ] Login/signup forms work on mobile
- [ ] Chat interface works on mobile
- [ ] Admin panel usable on tablet

---

## 🔧 Configuration Verification

### **Files to Review**

- [x] ✅ `next.config.mjs` - Security headers configured
- [x] ✅ `vercel.json` - Deployment settings configured
- [ ] `.env.production` - NOT committed to git
- [ ] `.gitignore` - Includes sensitive files

### **Environment Variables (Vercel)**

Verify all required variables are set:
```bash
# Check in Vercel Dashboard → Settings → Environment Variables
```

- [ ] All required variables present
- [ ] No typos in variable names
- [ ] Values are correct (no test/dummy values)
- [ ] MongoDB URI points to production database
- [ ] JWT secret is production-grade (256-bit)
- [ ] Email credentials are production
- [ ] API keys are production-ready

---

## 📊 Monitoring Setup

### **Uptime Monitoring**

- [ ] Set up UptimeRobot (https://uptimerobot.com)
  - [ ] Monitor: https://accucoder.app
  - [ ] Check interval: 5 minutes
  - [ ] Alert email: your-email@domain.com

- [ ] Set up SSL monitoring
  - [ ] Monitor certificate expiry
  - [ ] Alert 30 days before expiry
  - [ ] (Vercel handles renewal automatically)

### **Analytics**

- [ ] Vercel Analytics enabled
- [ ] Google Analytics added (optional)
- [ ] Error tracking configured (Sentry/LogRocket - optional)

### **Logging**

- [ ] Verify Vercel logs working
- [ ] Test error logging
- [ ] Monitor function invocations
- [ ] Check bandwidth usage

---

## 🔒 Security Hardening

### **Immediate Actions**

- [ ] Change all default passwords
- [ ] Rotate API keys if exposed
- [ ] Enable 2FA on all services:
  - [ ] Vercel account
  - [ ] GitHub account
  - [ ] MongoDB Atlas
  - [ ] name.com account

### **Security Audit**

- [ ] Run SSL Labs test: https://www.ssllabs.com/ssltest/
- [ ] Run SecurityHeaders.com: https://securityheaders.com
- [ ] Check Mozilla Observatory: https://observatory.mozilla.org
- [ ] Review Vercel security settings

### **Backup & Recovery**

- [ ] Database backups configured (MongoDB Atlas)
- [ ] Git repository backed up
- [ ] Environment variables documented securely
- [ ] Recovery plan documented

---

## 📈 Performance Optimization

### **Initial Optimizations**

- [x] ✅ Image optimization enabled
- [x] ✅ Static page generation
- [x] ✅ API response caching
- [ ] Review bundle size
- [ ] Enable compression
- [ ] Optimize database queries

### **CDN & Caching**

- [x] ✅ Vercel Edge Network active
- [x] ✅ Static assets cached
- [x] ✅ API responses cached (5 min - 1 hour)
- [ ] Cache invalidation tested

---

## 🎯 Go-Live Checklist

### **Final Checks Before Announcing**

- [ ] All critical features tested
- [ ] No major bugs
- [ ] SSL certificate active
- [ ] Custom domain working
- [ ] Email delivery working
- [ ] Database stable
- [ ] Performance acceptable
- [ ] Mobile experience good
- [ ] Security headers present
- [ ] Monitoring active

### **Communication**

- [ ] Update documentation with new URL
- [ ] Notify stakeholders
- [ ] Update social media profiles
- [ ] Update Google Search Console
- [ ] Submit sitemap to search engines

---

## 🆘 Rollback Plan

If something goes wrong:

### **Option 1: Revert Deployment**
```bash
# In Vercel Dashboard
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
```

### **Option 2: Rollback Git**
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys the revert
```

### **Option 3: Disable Custom Domain**
```bash
# In Vercel Dashboard
1. Settings → Domains
2. Remove accucoder.app
3. Site reverts to accucoder.vercel.app
```

---

## 📞 Emergency Contacts

- **Vercel Support**: support@vercel.com
- **name.com Support**: https://www.name.com/support
- **MongoDB Support**: https://support.mongodb.com
- **Brevo Support**: https://www.brevo.com/support
- **Groq Support**: https://groq.com/contact

---

## ✅ Deployment Complete!

Once all items are checked:

- ✅ **AccuCoder is live** at https://accucoder.app
- ✅ **SSL certificate active** (Let's Encrypt)
- ✅ **All features working**
- ✅ **Monitoring active**
- ✅ **Security hardened**
- ✅ **Performance optimized**

**Next Steps**:
1. Monitor for first 24-48 hours
2. Gather user feedback
3. Plan next iteration
4. Continue optimization

---

## 📊 Success Metrics

Track these metrics post-launch:

- **Uptime**: Target 99.9%
- **Response Time**: <2s average
- **SSL Labs Score**: A or A+
- **PageSpeed Score**: >80
- **Error Rate**: <0.1%
- **User Registrations**: Monitor growth
- **API Success Rate**: >99%

---

*Checklist completed: [Date]*  
*Deployed by: [Name]*  
*Production URL: https://accucoder.app*  
*Status: 🟢 LIVE*
