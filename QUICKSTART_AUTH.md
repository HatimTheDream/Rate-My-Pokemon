# 🚀 Quick Start: Google OAuth Setup

## ⚡ Fast Track (5 Minutes)

### 1️⃣ Google Cloud Console
**URL:** https://console.cloud.google.com/apis/credentials

1. **Create OAuth Client ID**
   - Type: Web application
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     http://localhost:5174
     ```
   - **Copy** Client ID & Secret

### 2️⃣ Supabase Dashboard
**URL:** https://app.supabase.com/project/_/auth/providers

1. **Enable Google Provider**
   - Toggle ON
   - Paste Client ID
   - Paste Client Secret
   - Save

2. **Get Your Keys** (Settings > API)
   - Copy Project URL
   - Copy anon/public key

### 3️⃣ Local Setup

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Restart server:
```powershell
npm run dev
```

### 4️⃣ Test
1. Open http://localhost:5174
2. Click "Sign In" (top-right)
3. Choose Google
4. Verify your avatar appears

---

## ✅ Success Indicators
- Google sign-in popup appears
- Redirects back to app
- Avatar shows in top-right
- Rating a Pokémon works
- Ratings persist on refresh

## 🐛 Common Issues

**"Provider is disabled"**
→ Toggle Google ON in Supabase dashboard

**"Redirect URI mismatch"**
→ Add both URIs to Google Cloud (see step 1)

**"Invalid credentials"**
→ Double-check Client ID/Secret match

---

📖 **Full Guide:** See `GOOGLE_OAUTH_SETUP.md`
