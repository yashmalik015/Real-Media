# Fix: Google Login Popup Closes Immediately on assetsweber.com

## Root Cause
Firebase is rejecting the authentication request because your production domain (`assetsweber.com`) is not authorized in Firebase console, causing the popup to close automatically.

## Solution: Configure Firebase Console (REQUIRED)

### Step 1: Add Authorized Domains
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **realmedia-9e290**
3. Go to **Authentication** → **Settings** tab
4. Scroll to **Authorized domains**
5. Click **Add domain**
6. Add these domains:
   - `assetsweber.com`
   - `www.assetsweber.com`
   - (Keep `localhost` for local dev)

**Wait 5-10 minutes** after adding domains before testing.

---

### Step 2: Configure OAuth Consent Screen
1. In Firebase Console, go to **Authentication** → **Settings** → **OAuth consent screen**
2. Make sure:
   - **App name**: Assets Weber
   - **User support email**: assetwebermail@gmail.com
   - **Developer contact**: assetwebermail@gmail.com
3. Click **Save and Continue**

---

### Step 3: Add Authorized Redirect URIs (if using custom OAuth app)
If you're using the default Firebase setup, this is automatic. But if you have a custom OAuth app:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **realmedia-9e290**
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click **Edit**
6. Under **Authorized redirect URIs**, add:
   ```
   https://assetsweber.com
   https://www.assetsweber.com
   https://assetsweber.firebaseapp.com
   ```
7. Click **Save**

---

### Step 4: Verify Hostinger Environment Variables
On your Hostinger server, ensure `.env` has:
```
VITE_API_URL=https://assetsweber.com
```

Rebuild and redeploy:
```bash
npm install
npm run build
npm start
```

---

## Testing
1. Go to https://assetsweber.com
2. Click "Continue with Google"
3. Google popup should now stay open
4. After login, you should be redirected back to your site

---

## If Still Not Working

### Option 1: Check Browser Console
1. Open https://assetsweber.com in your browser
2. Press F12 (DevTools)
3. Go to **Console** tab
4. Try logging in with Google
5. Look for error messages and share them

### Option 2: Check Firebase Logs
1. Firebase Console → **Authentication** → **Logs**
2. Look for failed login attempts
3. Error codes will show exactly what's wrong

### Option 3: Test with Direct Firebase Popup
Add this test script to your browser console to debug:
```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();

signInWithPopup(auth, provider)
  .then(result => console.log("Success:", result.user.email))
  .catch(error => console.error("Error:", error.code, error.message));
```

---

## Key Points
- **Domains must be exact**: `assetsweber.com` ≠ `www.assetsweber.com` (add both!)
- **Wait after changes**: Firebase may take 5-10 minutes to propagate
- **HTTPS only**: Google OAuth requires HTTPS on production
- **No trailing slashes**: Use `https://assetsweber.com` not `https://assetsweber.com/`
