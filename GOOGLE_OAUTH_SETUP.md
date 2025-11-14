# Google OAuth Setup Guide for Rate My Pokémon

## Prerequisites
- Supabase project created
- Google Cloud account

---

## Step 1: Configure Google Cloud OAuth

### 1.1 Create OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Choose **External** user type (or Internal if using Google Workspace)
5. Fill in required fields:
   - **App name**: Rate My Pokémon
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
6. Add scopes: `email` and `profile` (openid is automatic)
7. Add test users if using External type
8. Save and continue

### 1.2 Create OAuth Client ID
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Set name: `Rate My Pokémon Web Client`
5. Add **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   http://localhost:5174
   ```
   Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID
6. Click **Create**
7. **SAVE** the Client ID and Client Secret shown

---

## Step 2: Enable Google Provider in Supabase

### 2.1 Configure Google Auth
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Toggle **Enable Google provider** to ON
6. Paste your **Client ID** from Step 1.2
7. Paste your **Client Secret** from Step 1.2
8. Set **Redirect URL** (should be pre-filled):
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
9. Click **Save**

### 2.2 Get Supabase Keys
1. Go to **Settings** > **API**
2. Copy your **Project URL** (e.g., `https://abc123.supabase.co`)
3. Copy your **anon/public key** (the long string under "Project API keys")

---

## Step 3: Configure Local Environment

### 3.1 Create .env file
1. In your project root, create a file named `.env` (no extension)
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   Replace with actual values from Step 2.2

### 3.2 Restart Dev Server
```powershell
# Kill any running servers
Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force

# Start fresh
npm run dev
```

---

## Step 4: Test Sign-In Flow

### 4.1 Test Authentication
1. Open http://localhost:5174
2. Click **Sign In** in the top-right toolbar
3. Click **Continue with Google**
4. You should be redirected to Google sign-in
5. After signing in, you'll be redirected back to your app
6. Your avatar/email should appear in the top-right

### 4.2 Verify Features
- Check that your user avatar appears in toolbar
- Rate a Pokémon and verify it saves
- Refresh the page - ratings should persist
- Check browser console for any errors

---

## Troubleshooting

### "Provider is disabled"
- Ensure Google provider is toggled ON in Supabase dashboard
- Verify Client ID/Secret are correct
- Check that redirect URL matches exactly

### "Redirect URI mismatch"
- Ensure Google Cloud authorized redirect URIs include:
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
  - `http://localhost:5174` (for local dev)
- No trailing slashes
- Protocol (http vs https) must match exactly

### "Invalid credentials"
- Double-check Client ID and Secret in Supabase dashboard
- Regenerate credentials in Google Cloud if needed
- Wait a few minutes after saving changes

### Ratings not persisting
- Check browser console for Supabase errors
- Verify RLS policies are set up (or disabled for testing)
- Check that user ID is being passed correctly

---

## Database Setup (If Needed)

Your migrations should already be in place, but if ratings aren't saving:

### Check Tables Exist
```sql
-- In Supabase SQL Editor
SELECT * FROM user_ratings LIMIT 1;
SELECT * FROM rating_events LIMIT 1;
```

### Temporarily Disable RLS (for testing only)
```sql
ALTER TABLE user_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_events DISABLE ROW LEVEL SECURITY;
```

### Enable RLS with Policies (recommended for production)
```sql
-- Allow users to read all ratings
CREATE POLICY "Allow read for all users" ON user_ratings FOR SELECT USING (true);

-- Allow users to insert/update their own ratings
CREATE POLICY "Allow users to insert own ratings" ON user_ratings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own ratings" ON user_ratings 
  FOR UPDATE USING (auth.uid() = user_id);

-- Same for rating_events
CREATE POLICY "Allow read for all users" ON rating_events FOR SELECT USING (true);
CREATE POLICY "Allow users to insert own events" ON rating_events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Success Checklist

- [ ] Google OAuth consent screen created
- [ ] OAuth client ID created with correct redirect URIs
- [ ] Google provider enabled in Supabase with Client ID/Secret
- [ ] .env file created with Supabase URL and anon key
- [ ] Dev server restarted
- [ ] Sign-in redirects to Google successfully
- [ ] User redirected back to app after Google sign-in
- [ ] User avatar/email visible in top-right
- [ ] Ratings save and persist after refresh

---

## Next Steps After Setup

Once authentication works:
1. Implement proper RLS policies for production
2. Add user profile page
3. Add social features (share ratings, compare with friends)
4. Deploy to production (Vercel/Netlify)
5. Update Google OAuth redirect URIs for production domain
