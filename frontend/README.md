# PaddleOCR Frontend

A modern React frontend for the PaddleOCR ID Card Reader backend. This application guides users through a 4-step process to extract text from Egyptian ID cards.

## Features

- 🎨 Modern UI with TailwindCSS
- 📱 Fully responsive design
- 🔄 Multi-step workflow (Upload → Detect → Crop → OCR)
- ✅ Interactive box selection
- 🖼️ Image preview and overlay boxes
- 📊 Results display with BD derivation
- ⚡ Fast and lightweight

## Prerequisites

- Node.js 18+ and npm/yarn
- Flask backend running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
```bash
cd paddle_ocr/frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` if your backend runs on a different URL:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # API client wrapper
│   ├── components/
│   │   ├── BoxOverlay.jsx     # Bounding box overlay component
│   │   ├── ErrorBanner.jsx    # Error display component
│   │   └── Loading.jsx        # Loading spinner component
│   ├── context/
│   │   └── AppContext.jsx     # Global state management
│   ├── pages/
│   │   ├── Upload.jsx         # Step 1: Upload page
│   │   ├── Detect.jsx        # Step 2: Detect page
│   │   ├── Crop.jsx          # Step 3: Crop page
│   │   └── OcrResult.jsx     # Step 4: Results page
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Usage Flow

### Step 1: Upload
- Select an ID card image
- Preview the image
- Click "Upload & Detect" to proceed

### Step 2: Detect
- View detected bounding boxes overlaid on the image
- Select/deselect boxes using checkboxes
- Click "Crop Selected" to proceed

### Step 3: Crop
- Review all cropped regions
- Click "Run OCR" to extract text

### Step 4: Results
- View extracted text for each region
- See BD (Birth Date) automatically derived from Num1
- View raw JSON output
- Start over or navigate back

## API Integration

The frontend communicates with the backend via these endpoints:

- `POST /api/detect` - Upload image and detect regions
- `POST /api/crop` - Crop selected regions
- `POST /api/ocr` - Run OCR on cropped images
- `GET /api/health` - Health check

All API calls are handled by `src/api/client.js`.

## State Management

Global state is managed using React Context API (`AppContext`). The state includes:

- Image file and URL
- Detected boxes
- Selected boxes
- Crop map and URLs
- OCR results
- Loading and error states

## Styling

The application uses TailwindCSS for styling. Custom colors and configurations are in `tailwind.config.js`.

## Troubleshooting

### Backend Connection Issues

If you see "Cannot connect to backend" errors:

1. Ensure the Flask backend is running on port 8000
2. Check CORS settings in the backend
3. Verify `VITE_API_BASE_URL` in `.env`

### Image Not Displaying

- Check browser console for CORS errors
- Verify image URLs are correct
- Ensure backend serves static files correctly

### Boxes Not Showing

- Verify image has loaded completely
- Check that detection returned valid boxes
- Ensure image dimensions are calculated correctly

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `src/App.jsx`
4. Extend context if needed in `src/context/AppContext.jsx`

### Code Style

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use TailwindCSS for styling

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. The `dist/` folder contains the production build

3. Serve using any static file server:
   - Nginx
   - Apache
   - Vercel
   - Netlify
   - etc.

## License

Same as the main project.

