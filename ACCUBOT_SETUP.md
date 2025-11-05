# AccuBot - Groq AI Integration Setup

## ✅ What's Been Implemented

AccuBot is now powered by **Groq AI** with the high-performance **Llama 3.3 70B** model, specifically trained to be a Medical Coding and Billing Expert.

### Features:
- 🤖 **AI-Powered Responses**: Real-time answers using Groq's ultra-fast inference
- 💼 **Medical Coding Expertise**: Specialized in ICD-10-CM, CPT codes, and medical billing
- 🎯 **Smart Context**: Maintains conversation history for better understanding
- ⚡ **Fast Response**: Groq's LPU technology provides near-instant responses
- 🔄 **Loading States**: Visual feedback while AI is thinking
- 🎨 **Enhanced UI**: Updated placeholder and loading indicators

## 🔑 Getting Your Groq API Key

1. **Visit Groq Console**: Go to [https://console.groq.com](https://console.groq.com)

2. **Sign Up/Login**: Create a free account or login with existing credentials

3. **Navigate to API Keys**: Click on "API Keys" in the sidebar

4. **Create New Key**: 
   - Click "Create API Key"
   - Give it a name like "AccuCoder"
   - Copy the generated key (you won't see it again!)

5. **Add to .env.local**:
   ```bash
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

## 📋 What AccuBot Can Do

### ICD-10-CM Coding
- "What's the ICD-10 code for Type 2 diabetes?"
- "Find codes for hypertension with heart disease"
- "Difference between I10 and I11 codes?"

### CPT Coding
- "CPT code for knee arthroscopy?"
- "What modifiers should I use for bilateral procedures?"
- "Help with E/M coding for new patient visit"

### Medical Billing
- "How to handle claim denials?"
- "What's required for prior authorization?"
- "Billing guidelines for telehealth services"

### Code Lookup
- "Explain ICD-10 code J44.1"
- "What does CPT 99213 include?"
- "Related codes for appendectomy"

## 🚀 Testing AccuBot

1. **Restart Development Server** (if running):
   ```powershell
   # Stop the current server (Ctrl+C)
   pnpm dev
   ```

2. **Open AccuCoder**: Navigate to http://localhost:3000

3. **Click the Chat Icon**: Bottom-right floating button

4. **Try Sample Questions**:
   - "What ICD-10 code should I use for pneumonia?"
   - "Explain CPT code 99214"
   - "How to code a diabetes follow-up visit?"

## 🎯 AI Training Details

AccuBot is trained with a comprehensive system prompt that includes:

- **Medical Coding Standards**: ICD-10-CM and CPT guidelines
- **Compliance Knowledge**: HIPAA, coding compliance, documentation
- **Billing Expertise**: Claims, denials, reimbursement
- **Professional Tone**: Clear, concise, accurate responses
- **Safety Measures**: Recommends consulting certified coders for complex cases

## 🔧 Technical Details

### Model Configuration
- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: 0.3 (more consistent, factual responses)
- **Max Tokens**: 500 (concise answers)
- **Top P**: 0.9 (balanced creativity)

### API Endpoint
- **Route**: `/api/chat`
- **Method**: POST
- **Payload**: `{ messages: Array<Message> }`
- **Response**: `{ response: string }`

### Error Handling
- Network errors gracefully handled
- User-friendly error messages
- Automatic retry suggestions

## 💰 Groq Pricing (Free Tier)

Groq offers a **generous free tier**:
- Free API access with rate limits
- ~30 requests per minute
- Perfect for development and moderate usage
- Upgrade available for production scale

## 🔒 Security Best Practices

1. **Never commit .env.local** to version control (already in .gitignore)
2. **Keep API keys secure**: Don't share them publicly
3. **Rotate keys periodically**: Generate new keys if compromised
4. **Use environment variables**: Never hardcode keys in source

## 📝 Files Modified/Created

1. ✅ `app/api/chat/route.ts` - Groq AI integration endpoint
2. ✅ `components/floating-chat-bot.tsx` - Updated with API calls
3. ✅ `.env.local` - Added GROQ_API_KEY placeholder
4. ✅ `package.json` - Added groq-sdk dependency

## 🎉 Next Steps

1. Get your Groq API key from console.groq.com
2. Add it to `.env.local`
3. Restart the dev server
4. Start chatting with AccuBot!

---

**Note**: AccuBot provides coding assistance but should not replace professional medical coding judgment. Always verify codes with official guidelines and consult certified coders for complex cases.
