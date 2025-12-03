import os
import uuid
from typing import Any, Dict

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from services.detection_service import DetectionService
from services.crop_service import CropService
from services.ocr_service import OCRService
from services.utils import ensure_directories


def create_app() -> Flask:
    # Load .env once at startup so services see env vars
    load_dotenv()
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    
    # Enable CORS for all routes and origins
    CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

    # Static paths
    app.config["UPLOAD_FOLDER"] = os.path.join("static", "uploads")
    app.config["CROPS_FOLDER"] = os.path.join("static", "crops")

    ensure_directories([app.config["UPLOAD_FOLDER"], app.config["CROPS_FOLDER"]])

    # Initialize services
    # Note: OCRService uses lazy loading to avoid memory issues at startup
    try:
        detection_service = DetectionService()
        crop_service = CropService(crops_dir=app.config["CROPS_FOLDER"])
        ocr_service = OCRService()  # Models will load on first use
    except Exception as e:
        print(f"Warning: Service initialization error: {str(e)}")
        print("Services will be initialized on first use (lazy loading)")
        # Still create the service, but it will fail gracefully on first use
        detection_service = DetectionService()
        crop_service = CropService(crops_dir=app.config["CROPS_FOLDER"])
        ocr_service = OCRService()

    @app.route("/api/health", methods=["GET"])
    def health() -> Any:
        """Health check endpoint."""
        return jsonify({"status": "ok", "message": "PaddleOCR backend is running"}), 200

    @app.route("/api/detect", methods=["POST"])
    def detect() -> Any:
        """Run detection service on an image and return bounding boxes."""
        try:
            # Support both file upload and image_path
            image_path = None
            
            if "image" in request.files:
                # Handle file upload
                file = request.files["image"]
                if file.filename == "":
                    return jsonify({"error": "Empty filename"}), 400
                filename = secure_filename(file.filename)
                unique_name = f"{uuid.uuid4().hex}_{filename}"
                upload_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
                file.save(upload_path)
                image_path = upload_path
            else:
                # Handle image_path in JSON/form data
                data = request.form or request.json or {}
                image_path = data.get("image_path")
            
            if not image_path:
                return jsonify({"error": "Missing 'image' file or 'image_path' parameter"}), 400
            
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file not found: {image_path}"}), 400
            
            # Run detection
            detections = detection_service.detect(image_path)
            
            # Convert boxes to serializable format
            boxes = {label: list(box) for label, box in detections.items()}
            
            return jsonify({
                "boxes": boxes,
                "image_path": image_path,
                "image_url": "/" + image_path.replace("\\", "/")
            }), 200
            
        except ValueError as e:
            return jsonify({"error": f"Detection failed: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": f"Detection error: {str(e)}"}), 500

    @app.route("/api/crop", methods=["POST"])
    def crop() -> Any:
        """Crop detected regions from an image based on bounding boxes."""
        try:
            data = request.form or request.json or {}
            image_path = data.get("image_path")
            boxes = data.get("boxes")
            
            if not image_path:
                return jsonify({"error": "Missing 'image_path' parameter"}), 400
            
            # Convert relative paths to absolute if needed
            if not os.path.isabs(image_path):
                image_path = os.path.abspath(image_path)
            
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file not found: {image_path}"}), 400
            
            if not boxes:
                return jsonify({"error": "Missing 'boxes' parameter. Expected dict of label -> [x1, y1, x2, y2]"}), 400
            
            # Convert boxes from list format back to tuple format
            detections = {label: tuple(box) for label, box in boxes.items()}
            
            # Run cropping
            crop_map = crop_service.crop_regions(image_path, detections)
            
            # Ensure all paths in crop_map are absolute
            crop_map_absolute = {}
            for key, path in crop_map.items():
                if not os.path.isabs(path):
                    crop_map_absolute[key] = os.path.abspath(path)
                else:
                    crop_map_absolute[key] = path
            
            # Convert to web URLs - ensure paths are relative to static folder
            crops_web: Dict[str, str] = {}
            for key, path in crop_map_absolute.items():
                # Convert to forward slashes
                rel = path.replace("\\", "/")
                # Extract relative path from static folder
                if "static/crops" in rel:
                    # Get the part after static/crops
                    idx = rel.find("static/crops/")
                    if idx != -1:
                        crops_web[key] = "/" + rel[idx:]
                    else:
                        crops_web[key] = "/static/crops/" + os.path.basename(path)
                elif rel.startswith("/"):
                    crops_web[key] = rel
                else:
                    crops_web[key] = "/" + rel
            
            return jsonify({
                "crop_map": crop_map_absolute,
                "crops": crops_web,
                "image_path": image_path
            }), 200
            
        except Exception as e:
            return jsonify({"error": f"Cropping failed: {str(e)}"}), 500

    @app.route("/api/ocr", methods=["POST"])
    def ocr() -> Any:
        """Run OCR service on cropped images."""
        try:
            data = request.form or request.json or {}
            crop_map = data.get("crop_map")
            
            if not crop_map:
                return jsonify({"error": "Missing 'crop_map' parameter. Expected dict of label -> image_path"}), 400
            
            # Validate that all image paths exist and are valid
            validation_errors = []
            for label, path in crop_map.items():
                if not path or not isinstance(path, str):
                    validation_errors.append(f"Invalid path for {label}: {path}")
                    continue
                if not os.path.exists(path):
                    validation_errors.append(f"Image file not found for {label}: {path}")
                    continue
                # Check file size
                try:
                    file_size = os.path.getsize(path)
                    if file_size == 0:
                        validation_errors.append(f"Image file is empty for {label}: {path}")
                except Exception as e:
                    validation_errors.append(f"Cannot access file for {label}: {str(e)}")
            
            if validation_errors:
                return jsonify({"error": "Image validation failed", "details": validation_errors}), 400
            
            # Prepare image list in order: [Add1, Add2, Name1, Name2, Num1, Num2]
            image_order = ["Add1", "Add2", "Name1", "Name2", "Num1", "Num2"]
            image_list = []
            for label in image_order:
                if label in crop_map:
                    image_list.append(crop_map[label])
                else:
                    # If a required label is missing, add empty string or skip
                    return jsonify({"error": f"Missing required crop: {label}"}), 400
            
            # Run OCR with better error handling
            try:
                ocr_result = ocr_service.run_ocr(image_list)
            except ValueError as ve:
                return jsonify({"error": f"Image validation error: {str(ve)}"}), 400
            except FileNotFoundError as fe:
                return jsonify({"error": f"File not found: {str(fe)}"}), 404
            except Exception as ocr_e:
                return jsonify({"error": f"OCR processing failed: {str(ocr_e)}", "type": type(ocr_e).__name__}), 500
            
            # Always return result, even if empty
            response_data = {
                "result": ocr_result,
                "crop_map": crop_map
            }
            
            # Also include crops URLs if available from crop service
            # (crops are already in crop_map, but we can add web URLs)
            crops_web: Dict[str, str] = {}
            for key, path in crop_map.items():
                # Extract relative path for web
                rel = path.replace("\\", "/")
                if "static/crops" in rel:
                    idx = rel.find("static/crops/")
                    if idx != -1:
                        crops_web[key] = "/" + rel[idx:]
                    else:
                        crops_web[key] = f"/static/crops/{os.path.basename(path)}"
                else:
                    crops_web[key] = f"/static/crops/{os.path.basename(path)}"
            
            response_data["crops"] = crops_web
            
            return jsonify(response_data), 200
            
        except Exception as e:
            return jsonify({"error": f"OCR processing failed: {str(e)}", "type": type(e).__name__}), 500

    @app.route("/upload_only", methods=["POST"])  # returns saved image path/url
    def upload_only() -> Any:
        if "image" not in request.files:
            return jsonify({"error": "Missing 'image' file in form-data"}), 400
        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
        file.save(upload_path)
        web_url = "/" + upload_path.replace("\\", "/")
        return jsonify({"image_path": upload_path, "image_url": web_url}), 200

    @app.route("/detect_only", methods=["POST"])  # run detection and return boxes
    def detect_only() -> Any:
        data = request.form or request.json or {}
        image_path = data.get("image_path")
        if not image_path or not os.path.exists(image_path):
            return jsonify({"error": "Invalid or missing image_path"}), 400
        detections = detection_service.detect(image_path)
        return (
            jsonify(
                {"boxes": detections, "image_url": "/" + image_path.replace("\\", "/")}
            ),
            200,
        )

    @app.route("/ocr_only", methods=["POST"])  # run full OCR on existing image
    def ocr_only() -> Any:
        try:
            data = request.form or request.json or {}
            image_path = data.get("image_path")
            if not image_path:
                return jsonify({"error": "Missing image_path parameter"}), 400
            if not os.path.exists(image_path):
                return jsonify({"error": f"Image file not found: {image_path}"}), 400
            
            detections = detection_service.detect(image_path)
            crop_map = crop_service.crop_regions(image_path, detections)
            result: Dict[str, str] = ocr_service.process_crops(crop_map)
            crops_web: Dict[str, str] = {}
            for key, path in crop_map.items():
                rel = path.replace("\\", "/")
                crops_web[key] = "/" + rel if not rel.startswith("/") else rel
            return (
                jsonify(
                    {
                        "result": result,
                        "crops": crops_web,
                        "image_url": "/" + image_path.replace("\\", "/"),
                        "boxes": detections,
                    }
                ),
                200,
            )
        except Exception as exc:
            return jsonify({"error": f"OCR processing failed: {str(exc)}"}), 500

    @app.route("/upload", methods=["POST"])  # POST /upload
    def upload() -> Any:
        if "image" not in request.files:
            return jsonify({"error": "Missing 'image' file in form-data"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        filename = secure_filename(file.filename)
        # Ensure unique filename to avoid collisions
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        upload_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
        file.save(upload_path)

        try:
            # 1) Detect regions
            detections = detection_service.detect(upload_path)

            # 2) Crop regions
            crop_map = crop_service.crop_regions(upload_path, detections)

            # 3) OCR the cropped regions and build final JSON
            result: Dict[str, str] = ocr_service.process_crops(crop_map)

            # Also return crop URLs for frontend preview
            # Convert filesystem paths to web paths under /static
            crops_web: Dict[str, str] = {}
            for key, path in crop_map.items():
                # Normalize to forward slashes for URLs
                rel = path.replace("\\", "/")
                if rel.startswith("static/"):
                    crops_web[key] = "/" + rel
                else:
                    # attempt to find '/static/' segment
                    idx = rel.find("static/")
                    crops_web[key] = "/" + rel[idx:] if idx != -1 else rel

            payload: Dict[str, Dict[str, str]] = {
                "result": result,
                "crops": crops_web,
            }

            return jsonify(payload), 200
        except Exception as exc:  # pylint: disable=broad-except
            return jsonify({"error": str(exc)}), 500

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app = create_app()
    app.run(host="0.0.0.0", port=port, debug=False)

