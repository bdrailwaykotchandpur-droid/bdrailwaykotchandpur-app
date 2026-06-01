# Troubleshooting Guide: Icon & Data Fetching Issues

## ✅ FIXES APPLIED

### 1. **App Icon Issue (PWA)**
**Problem:** App icon wasn't showing because the manifest wasn't linked
**Fixed:**
- ✅ Added `<link rel="manifest" href="/manifest.webmanifest" />` to `index.html`
- ✅ Added `<meta name="theme-color" content="#f14f29" />` for browser theme
- ✅ Fixed icon paths in `manifest.webmanifest` from `../icons/` to `/icons/`
- ✅ Corrected MIME types from `image/png` to `image/webp`

**Test:** After rebuild, add app to home screen on mobile to see icons

---

### 2. **Data Fetching Issue**
**Root Causes:**
1. Vite development proxy was missing → Added to `vite.config.js`
2. TrainLocationFavicon.jsx had hardcoded fetch without error handling
3. CORS issues from backend

**Applied Fixes:**
- ✅ Added Vite development proxy for `/api` routes
- ✅ Fixed `TrainLocationFavicon.jsx` fetch with CORS headers
- ✅ Added better error handling in favicon update

---

## 🔍 DIAGNOSE DATA FETCHING PROBLEMS

### Step 1: Check Backend Status
```bash
curl -X GET "https://bdrailwaykotchandpur.onrender.com/api/health" -v
```

If this fails, the **backend is down/unreachable**. This is likely because:
- Render.com free tier apps go to sleep after 15 mins of inactivity
- The app needs to be restarted: Visit the Render dashboard → select app → "Deploy"

### Step 2: Check Browser Console
1. Open your app in browser
2. Press `F12` → Go to **Console** tab
3. Look for:
   - `API Base URL: https://bdrailwaykotchandpur.onrender.com` ✅ Should appear
   - `API Request: GET /api/trains` ✅ Should appear
   - Any red errors about CORS or network

### Step 3: Check Network Tab
1. Open **Network** tab in DevTools (F12)
2. Refresh page
3. Look for API requests:
   - Status `200` = Success ✅
   - Status `0` or timeout = Backend unreachable ❌
   - Status `403/404` = Wrong endpoint ❌

---

## 🛠️ COMMON FIXES

### Issue: "ট্রেনের তথ্য লোড করতে সমস্যা হয়েছে" (Can't load train information)

**Fix 1: Restart Backend** (Most Common)
- Go to: https://dashboard.render.com
- Select your app `bdrailwaykotchandpur`
- Click "Manual Deploy" or "Restart"
- Wait 2-3 minutes for it to restart

**Fix 2: Check API Endpoint**
In `src/services/api.jsx`, verify the endpoint is correct:
```javascript
const API_BASE_URL = 'https://bdrailwaykotchandpur.onrender.com';
```

**Fix 3: Enable CORS on Backend**
If backend is running but showing CORS errors, the backend needs:
```javascript
// In your backend (Node.js/Express example)
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

**Fix 4: Check Database Connection**
- Is MongoDB/database running?
- Check backend logs in Render dashboard for connection errors

---

## 📱 ANDROID APP ICON

Icons are properly configured in:
- ✅ `android/app/src/main/res/mipmap-*/ic_launcher.png` (all sizes)
- ✅ `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` (adaptive icon)
- ✅ `android/app/src/main/AndroidManifest.xml` references `@mipmap/ic_launcher`

If icon still doesn't show after rebuild:
```bash
cd android
./gradlew clean build
```

---

## 🌐 WEB APP ICON (Favicon)

Favicon files in place:
- ✅ `/public/favicon.svg` - Main favicon
- ✅ `/icons/icon-*.webp` - PWA icons
- ✅ Manifest linked in HTML

---

## 📝 QUICK TEST CHECKLIST

- [ ] Run `npm run build` to test production build
- [ ] Open app in browser, check Console (F12) for errors
- [ ] Check Network tab for failed API requests
- [ ] Test on mobile to see home screen icons
- [ ] Verify backend is running: `curl https://bdrailwaykotchandpur.onrender.com/api/health`
- [ ] Check Render dashboard for backend crashes

---

## 🚀 NEXT STEPS

1. **Immediate:** Restart your backend on Render.com
2. **Check:** Look at browser console for specific errors
3. **Rebuild:** Run `npm run build && npm run preview` locally
4. **Deploy:** When fixed, deploy new version with all the fixes applied

Need more help? Check backend logs in Render dashboard for specific error messages.
