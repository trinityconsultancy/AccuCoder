# AccuCoder SSL/HTTPS Deployment Guide

**Domain**: accucoder.app  
**Registrar**: name.com  
**Status**: Production Deployment Ready

---

## 🔒 SSL/TLS Configuration Overview

AccuCoder will use **automatic SSL certificates** through your hosting provider's built-in certificate management (Let's Encrypt or similar).

---

## 🌐 Recommended Deployment Options

### **Option 1: Vercel (Recommended)**

**Automatic SSL**: ✅ Free, automatic, renews automatically  
**Custom Domain**: ✅ Supported  
**Edge Network**: ✅ Global CDN  
**Zero Config**: ✅ Just connect and deploy

#### **Setup Steps**

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Add Custom Domain**
   - Go to Vercel Dashboard → Project Settings → Domains
   - Add `accucoder.app` and `www.accucoder.app`
   - Vercel will provide DNS records

3. **Configure name.com DNS**
   - Login to name.com account
   - Go to Domain Manager → accucoder.app → DNS Records
   - Add the following records:

   ```
   Type    Host    Answer/Value              TTL
   A       @       76.76.21.21              300
   CNAME   www     cname.vercel-dns.com.    300
   ```
   
   **OR** (if Vercel provides A records):
   ```
   Type    Host    Answer/Value         TTL
   A       @       76.76.21.21         300
   A       www     76.76.21.21         300
   ```

4. **SSL Certificate**
   - ✅ Automatically provisioned by Vercel (Let's Encrypt)
   - ✅ Auto-renewal every 90 days
   - ✅ HTTPS enforced by default
   - ✅ HTTP → HTTPS redirect automatic

5. **Verify SSL**
   - Wait 10-60 minutes for DNS propagation
   - Visit https://accucoder.app
   - Check certificate: Click padlock icon → Certificate is valid

---

### **Option 2: Netlify**

**Automatic SSL**: ✅ Free, automatic  
**Custom Domain**: ✅ Supported  
**Edge Network**: ✅ Global CDN

#### **Setup Steps**

1. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli
   
   # Login and deploy
   netlify login
   netlify deploy --prod
   ```

2. **Add Custom Domain**
   - Netlify Dashboard → Domain Settings → Add custom domain
   - Enter `accucoder.app`

3. **Configure name.com DNS**
   ```
   Type    Host    Answer/Value                      TTL
   A       @       75.2.60.5                        300
   CNAME   www     accucoder-app.netlify.app.       300
   ```

4. **SSL Certificate**
   - ✅ Automatically provisioned (Let's Encrypt)
   - ✅ Auto-renewal
   - ✅ HTTPS enforced

---

### **Option 3: AWS Amplify**

**Automatic SSL**: ✅ Free (AWS Certificate Manager)  
**Custom Domain**: ✅ Supported  
**Global CDN**: ✅ CloudFront

#### **Setup Steps**

1. **Deploy to AWS Amplify**
   - Create AWS account
   - AWS Amplify Console → New App → Deploy from Git
   - Connect GitHub repository
   - Build settings auto-detected (Next.js)

2. **Add Custom Domain**
   - Amplify Console → Domain management → Add domain
   - Enter `accucoder.app`
   - AWS provides DNS records

3. **Configure name.com DNS**
   ```
   Type     Host    Answer/Value                               TTL
   CNAME    @       [aws-amplify-domain].cloudfront.net.      300
   CNAME    www     [aws-amplify-domain].cloudfront.net.      300
   ```

4. **SSL Certificate**
   - ✅ Provisioned via AWS Certificate Manager
   - ✅ Auto-renewal
   - ✅ 2048-bit encryption

---

### **Option 4: DigitalOcean App Platform**

**Automatic SSL**: ✅ Free (Let's Encrypt)  
**Custom Domain**: ✅ Supported  
**Pricing**: $5-12/month

#### **Setup Steps**

1. **Deploy to DigitalOcean**
   - Create DigitalOcean account
   - App Platform → Create App → From GitHub
   - Select AccuCoder repository

2. **Add Custom Domain**
   - App Settings → Domains → Add Domain
   - Enter `accucoder.app`

3. **Configure name.com DNS**
   ```
   Type    Host    Answer/Value                 TTL
   CNAME   @       [app-name].ondigitalocean.app.   300
   CNAME   www     [app-name].ondigitalocean.app.   300
   ```

4. **SSL Certificate**
   - ✅ Let's Encrypt certificate auto-provisioned
   - ✅ Auto-renewal
   - ✅ Force HTTPS option available

---

## 🔧 Next.js Configuration for Production

### **1. Update `next.config.mjs`**

<function_calls>
<invoke name="read_file">
<parameter name="filePath">c:\Users\rusha\Downloads\AccuCoder\next.config.mjs