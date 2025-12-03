# PaddleOCR Backend Summary

## Overview
A Flask-based REST API backend for processing Egyptian ID card images. The system performs object detection, image cropping, and OCR (Optical Character Recognition) to extract structured text from ID cards.

## Architecture

### Technology Stack
- **Framework**: Flask 3.0.3
- **Deep Learning**: PyTorch + Faster R-CNN for object detection
- **OCR**: PaddleOCR (supports Arabic and English)
- **Image Processing**: OpenCV, PIL/Pillow
- **CORS**: Flask-CORS for cross-origin requests

### Core Services

#### 1. DetectionService (`services/detection_service.py`)
- **Purpose**: Detects regions on ID card images using Faster R-CNN
- **Model**: Custom Faster R-CNN model (`fasterrcnn_custom_epoch_10.pth`)
- **Detected Classes**:
  - `Add1`: Address line 1
  - `Add2`: Address line 2
  - `BD`: Birth Date (NOT detected/cropped - automatically derived from Num1 using Egyptian ID format)
  - `Name1`: Name line 1
  - `Name2`: Name line 2
  - `Num1`: National ID number (14 digits) - used to derive BD
  - `Num2`: Additional number (6 digits)
- **Output**: Dictionary mapping label → bounding box `(x1, y1, x2, y2)`
- **Score Threshold**: 0.25 (configurable via `DETECTION_SCORE_THRESHOLD` env var)

#### 2. CropService (`services/crop_service.py`)
- **Purpose**: Crops detected regions from the original image
- **Technology**: OpenCV
- **Features**:
  - Validates crop dimensions (minimum 64x64 pixels)
  - Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) for image enhancement
  - Saves crops to `static/crops/` directory
  - Excludes BD class (BD is derived from Num1, not cropped)
- **Output**: Dictionary mapping label → file path of cropped image

#### 3. OCRService (`services/ocr_service.py`)
- **Purpose**: Extracts text from cropped images using PaddleOCR and derives BD from Num1
- **Models**: 
  - Arabic OCR (`ar`) for: Add1, Add2, Name1, Name2, Num1
  - English OCR (`en`) for: Num2
- **Features**:
  - **Lazy Loading**: Models initialize only on first use (prevents startup crashes)
  - Image validation before processing
  - Error handling for tensor memory issues
  - Returns empty arrays for failed images (graceful degradation)
  - **BD Derivation**: Automatically derives Birth Date from Num1 using Egyptian ID format
- **Output**: Dictionary mapping label → list of extracted text strings, plus BD derived from Num1

## API Endpoints

### Main API Routes (Recommended)

#### `GET /api/health`
- **Purpose**: Health check endpoint
- **Response**: `{"status": "ok", "message": "PaddleOCR backend is running"}`

#### `POST /api/detect`
- **Purpose**: Detect regions on an ID card image
- **Input**: 
  - File upload: `image` (multipart/form-data)
  - OR JSON: `{"image_path": "path/to/image.jpg"}`
- **Response**: 
  ```json
  {
    "boxes": {
      "Add1": [x1, y1, x2, y2],
      "Add2": [x1, y1, x2, y2],
      ...
    },
    "image_path": "path/to/image.jpg",
    "image_url": "/static/uploads/image.jpg"
  }
  ```

#### `POST /api/crop`
- **Purpose**: Crop detected regions from an image
- **Input**: 
  ```json
  {
    "image_path": "path/to/image.jpg",
    "boxes": {
      "Add1": [x1, y1, x2, y2],
      "Add2": [x1, y1, x2, y2],
      ...
    }
  }
  ```
- **Response**:
  ```json
  {
    "crop_map": {
      "Add1": "absolute/path/to/Add1.png",
      "Add2": "absolute/path/to/Add2.png",
      ...
    },
    "crops": {
      "Add1": "/static/crops/Add1.png",
      "Add2": "/static/crops/Add2.png",
      ...
    },
    "image_path": "path/to/image.jpg"
  }
  ```

#### `POST /api/ocr`
- **Purpose**: Run OCR on cropped images
- **Input**:
  ```json
  {
    "crop_map": {
      "Add1": "path/to/Add1.png",
      "Add2": "path/to/Add2.png",
      "Name1": "path/to/Name1.png",
      "Name2": "path/to/Name2.png",
      "Num1": "path/to/Num1.png",
      "Num2": "path/to/Num2.png"
    }
  }
  ```
- **Response**:
  ```json
  {
    "result": {
      "Add1": ["extracted", "text", "array"],
      "Add2": ["extracted", "text"],
      "Name1": ["name", "text"],
      "Name2": ["name", "text"],
      "Num1": ["29001012345678"],
      "Num2": ["123456"],
      "BD": ["01/01/1990"]
    },
    "crop_map": {...},
    "crops": {
      "Add1": "/static/crops/Add1.png",
      ...
    }
  }
  ```
  **Note**: BD is automatically derived from Num1. If Num1 is `"29001012345678"`, BD will be `"01/01/1990"` (extracted from first 7 digits: 2=1900s, 90=1990, 01=January, 01=1st day).

### Legacy/Alternative Endpoints

#### `POST /upload_only`
- Upload image only, returns saved path/URL

#### `POST /detect_only`
- Run detection on existing image (requires `image_path`)

#### `POST /ocr_only`
- Run full pipeline (detect + crop + OCR) on existing image

#### `POST /upload`
- **All-in-one endpoint**: Upload → Detect → Crop → OCR → Derive BD
- **Input**: `image` (file upload)
- **Response**: Complete result with OCR text, BD (derived from Num1), and crop URLs

## Workflow

### Step-by-Step Process

1. **Upload Image** → Saved to `static/uploads/` with unique filename
2. **Detection** → Faster R-CNN detects 6 regions (Add1, Add2, Name1, Name2, Num1, Num2)
   - Note: BD is NOT detected (it's derived from Num1)
3. **Cropping** → Each detected region is cropped, enhanced, and saved to `static/crops/`
   - BD is skipped (not cropped)
4. **OCR** → PaddleOCR extracts text from each crop:
   - Arabic OCR for Add1, Add2, Name1, Name2, Num1
   - English OCR for Num2
5. **BD Derivation** → Birth Date is automatically calculated from Num1:
   - Extracts first 7 digits from Num1
   - Format: `[Century][YY][MM][DD]`
   - Century: 2 = 1900s, 3 = 2000s
   - Converts to `DD/MM/YYYY` format
6. **Response** → Returns structured JSON with extracted text, BD, and crop URLs

## Configuration

### Environment Variables (`.env` file)
```env
MODEL_WEIGHTS_PATH=models/fasterrcnn_custom_epoch_10.pth
DETECTION_SCORE_THRESHOLD=0.25
CROP_MAX_SIZE=800
PORT=8000
```

### Directory Structure
```
paddle_ocr/
├── app.py                    # Main Flask application
├── models/
│   ├── model_loader.py       # Faster R-CNN model loader
│   └── fasterrcnn_custom_epoch_10.pth  # Trained model weights
├── services/
│   ├── detection_service.py  # Object detection
│   ├── crop_service.py      # Image cropping
│   ├── ocr_service.py        # OCR processing
│   ├── model_loader.py        # Model loading utilities
│   └── utils.py              # Helper functions
├── static/
│   ├── uploads/              # Uploaded images
│   └── crops/                # Cropped regions
├── requirements.txt          # Python dependencies
└── start_server.bat         # Windows startup script
```

## Key Features

### 1. Lazy Loading
- OCR models (PaddleOCR) load only when first needed
- Prevents memory access violations at server startup
- Reduces initial memory footprint

### 2. Automatic BD Derivation
- Birth Date is automatically calculated from Num1 (Egyptian National ID)
- No need to detect or crop BD region
- Format: Extracts first 7 digits and converts to `DD/MM/YYYY`
- Handles both 1900s (century code 2) and 2000s (century code 3)
- Example: Num1 = `"29001012345678"` → BD = `"01/01/1990"`

### 3. Error Handling
- Comprehensive error handling at each step
- Graceful degradation (returns empty arrays for failed OCR)
- Detailed error messages for debugging

### 4. Image Validation
- Validates file existence, size, and format
- Checks crop dimensions before processing
- Prevents crashes from invalid images

### 5. CORS Support
- Configured for cross-origin requests
- Supports all HTTP methods (GET, POST, OPTIONS)
- Allows all origins (configurable)

### 6. Static File Serving
- Serves cropped images via `/static/crops/`
- Serves uploaded images via `/static/uploads/`
- Returns both absolute paths and web URLs

## Dependencies

```
Flask==3.0.3
Werkzeug==3.0.3
torch>=2.1.0
torchvision>=0.16.0
opencv-python==4.10.0.84
Pillow==10.4.0
requests==2.32.3
python-dotenv==1.0.1
Flask-Cors==4.0.1
paddlepaddle>=2.5.0
paddleocr>=2.7.0
numpy>=1.24.0
```

## Running the Server

### Method 1: Direct Python
```bash
python app.py
```

### Method 2: Windows Batch Script
```bash
start_server.bat
```

### Default Configuration
- **Host**: `0.0.0.0` (all interfaces)
- **Port**: `8000` (configurable via `PORT` env var)
- **Debug Mode**: `False` (production mode)

## API Usage Examples

### Example 1: Step-by-Step Workflow
```bash
# 1. Upload and detect
curl -X POST http://localhost:8000/api/detect \
  -F "image=@id_card.jpg"

# 2. Crop detected regions
curl -X POST http://localhost:8000/api/crop \
  -H "Content-Type: application/json" \
  -d '{"image_path": "...", "boxes": {...}}'

# 3. Run OCR
curl -X POST http://localhost:8000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"crop_map": {...}}'
```

### Example 2: All-in-One
```bash
curl -X POST http://localhost:8000/upload \
  -F "image=@id_card.jpg"
```

## Known Issues & Solutions

### 1. Tensor Memory Errors
- **Issue**: PaddleOCR sometimes throws "Tensor holds no memory" errors
- **Solution**: Code handles gracefully, returns empty arrays for failed images
- **Workaround**: Ensure images are valid, properly formatted, and not corrupted

### 2. Model Loading
- **Issue**: Large models can cause memory issues at startup
- **Solution**: Lazy loading implemented for OCR models
- **Note**: Detection model still loads at startup (required for detection service)

### 3. Image Format Support
- **Supported**: JPEG, PNG, and other formats supported by PIL/OpenCV
- **Recommendation**: Use JPEG or PNG for best compatibility

## Security Considerations

⚠️ **Production Recommendations:**
- Add authentication/authorization
- Implement rate limiting
- Validate file types and sizes
- Sanitize file uploads
- Use HTTPS
- Add request logging and monitoring
- Implement input validation and sanitization

## Performance

- **Detection**: ~1-2 seconds per image (depends on GPU/CPU)
- **Cropping**: <1 second
- **OCR**: ~2-5 seconds per image (6 crops total)
- **Total Pipeline**: ~5-10 seconds per ID card

## Future Enhancements

- [ ] Add caching for frequently processed images
- [ ] Implement batch processing
- [ ] Add image quality assessment
- [ ] Support for multiple ID card formats
- [ ] Database integration for storing results
- [ ] WebSocket support for real-time processing
- [ ] Docker containerization
- [ ] Kubernetes deployment configurations

