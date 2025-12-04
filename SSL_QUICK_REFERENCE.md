# SSL/HTTPS Quick Reference - AccuCoder

## ✅ SSL Configuration Summary

**Domain**: accucoder.app  
**SSL Provider**: Let's Encrypt (via Vercel)  
**Certificate Type**: Domain Validation (DV)  
**Encryption**: TLS 1.3, RSA 2048-bit  
**Auto-renewal**: ✅ Yes (every 90 days)  
**Cost**: ✅ FREE

---

## 🚀 Quick Deployment (5 Steps)

### **1. Deploy to Vercel**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### **2. Add Domain in Vercel**
- Dashboard → Domains → Add `accucoder.app`

### **3. Update DNS at name.com**
```
Type: A, Host: @, Value: 76.76.21.21
Type: A, Host: www, Value: 76.76.21.21
```

### **4. Wait for SSL (10-60 min)**
- Vercel auto-provisions Let's Encrypt certificate
- Check: Dashboard shows "SSL: Active ✅"

### **5. Verify HTTPS**
- Visit: https://accucoder.app
- See padlock icon 🔒
- Check: https://www.ssllabs.com/ssltest/analyze.html?d=accucoder.app

---

## 🔒 Security Headers (Already Configured)

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

These are automatically applied via `next.config.mjs` and `vercel.json`.

---

## 🌐 DNS Records (name.com)

**Current Configuration**:
```
Type    Host    Value               TTL
A       @       76.76.21.21        300
A       www     76.76.21.21        300
```

**Alternative Configuration** (if Vercel provides):
```
Type    Host    Value                        TTL
CNAME   @       cname.vercel-dns.com.       300
CNAME   www     cname.vercel-dns.com.       300
```

**Note**: Use the exact records shown in your Vercel dashboard!

---

## ⚙️ Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-with-crypto>
GROQ_API_KEY=gsk_...
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@accucoder.app
NEXT_PUBLIC_APP_URL=https://accucoder.app
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✔️ SSL Verification Checklist

- [ ] **HTTPS works**: https://accucoder.app loads
- [ ] **Padlock visible**: Browser shows 🔒 icon
- [ ] **HTTP redirects**: http://accucoder.app → https://accucoder.app
- [ ] **WWW redirects**: www.accucoder.app → accucoder.app
- [ ] **SSL Labs A+**: https://www.ssllabs.com/ssltest/
- [ ] **No mixed content**: No warnings in browser console
- [ ] **HSTS active**: Header present (check dev tools)
- [ ] **Certificate valid**: Issued by Let's Encrypt, 90-day validity

---

## 🔧 Files Modified for SSL

1. **`next.config.mjs`**
   - Added security headers (HSTS, X-Frame-Options, etc.)
   - Added www → non-www redirect
   - Enabled image optimization for custom domain

2. **`vercel.json`**
   - Added environment variables
   - Added security headers
   - Added redirect rules
   - Configured SSL settings

---

## 🆘 Common Issues & Solutions

### **Issue 1: "SSL Certificate Pending"**
**Solution**: Wait 10-60 minutes after DNS propagation

### **Issue 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"**
**Solution**: Clear browser cache, wait for DNS propagation

### **Issue 3: "DNS_PROBE_FINISHED_NXDOMAIN"**
**Solution**: 
- Verify DNS records at name.com
- Check: https://dnschecker.org/#A/accucoder.app
- Wait up to 48 hours (usually 5-60 min)

### **Issue 4: "Mixed Content Warnings"**
**Solution**: 
- Check browser console
- Ensure all resources use `https://`
- Update any hardcoded `http://` URLs

---

## 📊 SSL Certificate Details

```
Common Name: accucoder.app
Subject Alternative Names: accucoder.app, www.accucoder.app
Issuer: Let's Encrypt Authority X3
Valid From: [Auto-generated]
Valid To: [90 days from issuance]
Signature Algorithm: SHA256-RSA
Public Key: RSA 2048 bits
```

**Auto-renewal**: Vercel renews 30 days before expiry automatically.

---

## 🔗 Important URLs

- **Production Site**: https://accucoder.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **DNS Checker**: https://dnschecker.org
- **name.com DNS**: https://www.name.com/account/domain/dns
- **Vercel Docs**: https://vercel.com/docs

---

## 📱 Test Commands

```bash
# Test HTTPS
curl -I https://accucoder.app

# Test HTTP → HTTPS redirect
curl -I http://accucoder.app

# Test SSL certificate
echo | openssl s_client -connect accucoder.app:443 -servername accucoder.app 2>/dev/null | openssl x509 -noout -dates

# Check DNS
nslookup accucoder.app

# Check all DNS globally
curl https://dnschecker.org/all-dns-records-of-domain.php?query=accucoder.app
```

---

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ `https://accucoder.app` loads with padlock
2. ✅ `http://accucoder.app` redirects to HTTPS
3. ✅ `www.accucoder.app` redirects to main domain
4. ✅ SSL Labs shows **A or A+ rating**
5. ✅ All security headers present
6. ✅ No browser console errors
7. ✅ All features working (login, chat, search)
8. ✅ Database connections working
9. ✅ Email verification working
10. ✅ API endpoints responding correctly

---

## 🔐 Security Grade Targets

| Test | Target | Check URL |
|------|--------|-----------|
| **SSL Labs** | A+ | https://www.ssllabs.com/ssltest/ |
| **SecurityHeaders.com** | A | https://securityheaders.com/?q=accucoder.app |
| **Mozilla Observatory** | A+ | https://observatory.mozilla.org/ |
| **ImmuniWeb** | A | https://www.immuniweb.com/ssl/ |

---

## 💡 Pro Tips

1. **HSTS Preload** (Optional, for maximum security):
   - Add domain to: https://hstspreload.org
   - Requires: HSTS max-age ≥ 31536000 (1 year)
   - We're ready: Already set to 63072000 (2 years)

2. **CAA Records** (Optional, extra security):
   ```
   Type: CAA, Host: @, Value: 0 issue "letsencrypt.org"
   ```

3. **Monitor SSL Expiry**:
   - Vercel handles renewal automatically
   - Set up external monitoring: https://uptimerobot.com

4. **Backup Domain**:
   - Consider `accucoder.com` as backup/redirect

---

## 📞 Support Contacts

- **Vercel Support**: support@vercel.com
- **name.com Support**: https://www.name.com/support
- **Let's Encrypt Community**: https://community.letsencrypt.org

---

*Quick Reference Guide | Last Updated: December 2024*
