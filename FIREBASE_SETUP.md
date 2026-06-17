# Firebase Configuration for Production

## Google Auth Error Fix: "The requested action is invalid"

This error occurs when Firebase doesn't recognize your domain as authorized for Google Sign-In.

### Steps to fix on Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `realmedia-9e290`
3. Navigate to **Authentication** → **Settings** tab
4. Under **Authorized domains**, click **Add domain**
5. Add your production domain:
   - `assetsweber.com`
   - `www.assetsweber.com`

### For local development:
- `localhost` (already added by default)
- `localhost:5173` (Vite dev server)
- `localhost:4000` (API server)

### Environment Variables (for production):

Make sure your `.env` file on Hostinger has:
```
VITE_API_URL=https://assetsweber.com
```

This ensures the React app communicates with your production API correctly.

## Verification

After adding authorized domains, test Google login again. The error should resolve within 5-10 minutes after domain is added.
