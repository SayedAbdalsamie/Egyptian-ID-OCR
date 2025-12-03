# Quick Start Guide

## If Nothing Appears in Browser

### Step 1: Check if Dev Server is Running

Open terminal in the frontend folder and run:
```bash
cd paddle_ocr/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 2: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Look for any red error messages

Common errors:
- **Module not found**: Run `npm install`
- **Cannot find module**: Check file paths
- **CORS error**: Backend not running or CORS not configured

### Step 3: Verify Files Exist

Check these files exist:
- `frontend/src/main.jsx` ✓
- `frontend/src/App.jsx` ✓
- `frontend/src/pages/Upload.jsx` ✓
- `frontend/src/context/AppContext.jsx` ✓
- `frontend/index.html` ✓

### Step 4: Reinstall Dependencies

If nothing works, try:
```bash
cd paddle_ocr/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Step 5: Check Port 3000

Make sure port 3000 is not already in use:
```bash
# Windows
netstat -ano | findstr :3000

# If port is in use, kill the process or change port in vite.config.js
```

### Step 6: Verify Backend is Running

The frontend needs the backend on port 8000:
```bash
cd paddle_ocr
python app.py
```

### Still Not Working?

1. Check browser console for errors (F12)
2. Check terminal where `npm run dev` is running for errors
3. Try accessing `http://localhost:3000` in incognito mode
4. Clear browser cache (Ctrl+Shift+Delete)

## Expected Behavior

When working correctly, you should see:
- Gradient purple/blue background
- White card with "Step 1: Upload ID Card" heading
- File input button
- "Upload & Detect" button
- "Reset" button

