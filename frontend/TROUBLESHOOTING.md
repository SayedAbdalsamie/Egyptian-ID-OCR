# Frontend Troubleshooting

## Problem: Nothing Appears in Browser

### Solution 1: Start the Dev Server

**Open a NEW terminal window** and run:
```bash
cd "C:\progremming\task zagzig\AI_0\Amit\go\final Project\paddle_ocr\frontend"
npm run dev
```

Wait for this message:
```
✓ ready in xxx ms
➜  Local:   http://localhost:3000/
```

Then open `http://localhost:3000` in your browser.

### Solution 2: Check Browser Console

1. Open browser (Chrome/Edge)
2. Press **F12** (or Right-click → Inspect)
3. Click **Console** tab
4. Look for **RED error messages**

**Common Errors:**

**Error: "Cannot find module"**
```bash
cd frontend
npm install
npm run dev
```

**Error: "Failed to fetch" or CORS error**
- Make sure Flask backend is running on port 8000
- Run: `cd paddle_ocr && python app.py`

**Error: "Port 3000 already in use"**
- Close other terminal windows running `npm run dev`
- Or change port in `vite.config.js`

### Solution 3: Verify Installation

Run these commands:
```bash
cd "C:\progremming\task zagzig\AI_0\Amit\go\final Project\paddle_ocr\frontend"

# Check if node_modules exists
dir node_modules

# If missing, install:
npm install

# Then start:
npm run dev
```

### Solution 4: Clear Cache and Reinstall

```bash
cd "C:\progremming\task zagzig\AI_0\Amit\go\final Project\paddle_ocr\frontend"

# Remove node_modules
rmdir /s /q node_modules

# Remove lock file
del package-lock.json

# Reinstall
npm install

# Start server
npm run dev
```

### Solution 5: Check File Structure

Make sure these files exist:
```
frontend/
├── index.html          ✓
├── package.json       ✓
├── vite.config.js     ✓
├── src/
│   ├── main.jsx       ✓
│   ├── App.jsx        ✓
│   ├── index.css      ✓
│   ├── pages/
│   │   └── Upload.jsx ✓
│   └── context/
│       └── AppContext.jsx ✓
```

### Solution 6: Test with Simple Component

If still not working, test with a simple component. Replace `src/App.jsx` content with:

```jsx
function App() {
  return (
    <div style={{ padding: '20px', color: 'white', background: 'blue' }}>
      <h1>React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
    </div>
  );
}

export default App;
```

If this works, the issue is with the components. If this doesn't work, the issue is with Vite/React setup.

### Expected Result

When working, you should see:
- **Purple/blue gradient background**
- **White card** in the center
- **"Step 1: Upload ID Card"** heading
- **File input** button
- **"Upload & Detect"** button

### Still Not Working?

1. **Check terminal output** - Look for error messages when running `npm run dev`
2. **Try different browser** - Chrome, Firefox, Edge
3. **Try incognito mode** - Rules out browser extensions
4. **Check firewall** - Windows Firewall might block port 3000
5. **Restart computer** - Sometimes fixes port/process issues

### Quick Test Commands

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# Check if Vite is installed
npm list vite
```

