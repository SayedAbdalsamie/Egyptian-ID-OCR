# 
ID Card Reader (Flask)

This Flask microservice accepts an Egyptian ID image, detects regions (Faster R-CNN), crops them, performs OCR via PaddleOCR, and returns structured JSON.

## Features

- POST /upload endpoint (multipart field: image)
- Detection via Faster R-CNN
- Cropping with OpenCV (enhanced image quality)
- OCR via PaddleOCR with language selection:
  - Arabic (ar) for all classes except Num2
  - English (en) for Num2
- Utilities for Eastern Arabic numerals and BD derivation from National ID
- Multiple endpoints: `/upload_only`, `/detect_only`, `/ocr_only`, `/upload`

## Project Structure

```
paddle_ocr/
├── app.py                    # Flask application
├── models/
│   ├── model_loader.py      # Faster R-CNN model loader
│   └── fasterrcnn_custom_epoch_10.pth
├── services/
│   ├── detection_service.py  # Faster R-CNN detection
│   ├── crop_service.py       # OpenCV cropping with enhancement
│   ├── ocr_service.py        # PaddleOCR with language selection
│   └── utils.py              # Date derivation and numeral conversion
├── static/
│   ├── uploads/              # Uploaded images
│   └── crops/                # Cropped regions
├── requirements.txt
└── README.md
```

## Setup

1. Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Optional `.env` file:
   ```
   MODEL_WEIGHTS_PATH=models/fasterrcnn_custom_epoch_10.pth
   DETECTION_SCORE_THRESHOLD=0.25
   CROP_MAX_SIZE=800
   PORT=8000
   ```

## Run

```bash
python app.py
```

The server will start on `http://0.0.0.0:8000`

## API Endpoints

### POST /upload
Main endpoint: Upload image, detect, crop, and OCR.
- Form: `image` (file)
- Returns JSON with: `result` (Add1, Add2, Name1, Name2, Num1, Num2, BD) and `crops` (URLs to cropped images)

### POST /upload_only
Upload image only, returns saved path/URL.
- Form: `image` (file)
- Returns: `image_path`, `image_url`

### POST /detect_only
Run detection on existing image.
- Form/JSON: `image_path`
- Returns: `boxes` (detections), `image_url`

### POST /ocr_only
Run full OCR pipeline on existing image.
- Form/JSON: `image_path`
- Returns: `result`, `crops`, `image_url`, `boxes`

## Output Format

```json
{
  "result": {
    "Add1": "extracted text...",
    "Add2": "extracted text...",
    "Name1": "extracted text...",
    "Name2": "extracted text...",
    "Num1": "12345678901234",
    "Num2": "123456",
    "BD": "01/01/1990"
  },
  "crops": {
    "Add1": "/static/crops/Add1.png",
    "Add2": "/static/crops/Add2.png",
    ...
  }
}
```

## Notes

- BD (Birth Date) is automatically derived from Num1 (Egyptian National ID format)
- Add2 numerals are converted to Eastern Arabic format
- BD class is excluded from cropping (derived from Num1)
- Num2 uses English OCR, all other classes use Arabic OCR
- Cropped images are enhanced with CLAHE for better OCR accuracy

## Windows

If PyTorch install via pip fails, use the official PyTorch instructions, then install the rest of requirements.

## Security

Add authentication, validation, and rate limiting before production use.
