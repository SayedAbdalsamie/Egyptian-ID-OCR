import os
from typing import Any

import torch


class ModelLoader:
    """Loads Faster R-CNN model for detection."""

    def __init__(self, num_classes: int, weights_path: str | None = None):
        self.num_classes = num_classes
        # Default to model in models directory
        if weights_path is None:
            # Get models directory (parent of this file's directory)
            models_dir = os.path.dirname(os.path.dirname(__file__))
            self.weights_path = os.path.join(models_dir, "models", "fasterrcnn_custom_epoch_10.pth")
        else:
            self.weights_path = weights_path

    def load(self) -> Any:
        try:
            from torchvision.models.detection import fasterrcnn_resnet50_fpn
        except Exception:
            raise RuntimeError(
                "torchvision is not available; cannot load detector model"
            )

        def build_model(num_classes: int) -> Any:
            try:
                return fasterrcnn_resnet50_fpn(
                    weights=None, weights_backbone=None, num_classes=num_classes
                )
            except TypeError:
                return fasterrcnn_resnet50_fpn(weights=None, num_classes=num_classes)

        model = build_model(self.num_classes)

        if not os.path.exists(self.weights_path):
            raise RuntimeError(f"Model weights not found at {self.weights_path}")

        try:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            state = torch.load(self.weights_path, map_location=device)
            try:
                model.load_state_dict(state, strict=False)
            except RuntimeError as e:
                cls_key = "roi_heads.box_predictor.cls_score.weight"
                if cls_key in state:
                    inferred_num_classes = int(state[cls_key].shape[0])
                    model = build_model(inferred_num_classes)
                    model.load_state_dict(state, strict=False)
                else:
                    raise RuntimeError(f"Failed to load model weights: {e}")
        except Exception as e:
            raise RuntimeError(f"Failed to load model weights: {e}")

        model.eval()
        model.to(device)
        return model
