import base64
import io
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import List

import numpy as np
from PIL import Image, ImageDraw
from ultralytics import YOLO

from multimodal_classifier import (
    DEFAULT_IMAGE_SIZE,
    MultiModalPredictor,
    Prediction,
)

try:
    import easyocr
except ImportError as exc:
    easyocr = None
    EASYOCR_IMPORT_ERROR = exc
else:
    EASYOCR_IMPORT_ERROR = None


@dataclass
class DetectionResult:
    bbox: tuple[int, int, int, int]
    ocr_text: str
    prediction: Prediction
    crop_base64: str


@dataclass
class AnalysisResult:
    image_name: str
    image_base64: str
    annotated_base64: str
    detections: List[DetectionResult]
    item_counts: List[tuple[str, int]]


def _pil_to_base64(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _resolve_weights_dir(root: Path) -> Path:
    for candidate in ("weights", "weigths"):
        path = root / candidate
        if path.exists():
            return path
    raise FileNotFoundError("Could not find a weights directory.")


class ProductAnalysisPipeline:
    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root
        self.weights_dir = _resolve_weights_dir(project_root)
        self.labels_path = project_root / "labels.json"
        self.detector = YOLO(str(self.weights_dir / "yolo_product_detection.pt"))
        self.classifier = MultiModalPredictor(
            weights_path=self.weights_dir / "multimodal_resnet50_distilbert.pt",
            labels_path=self.labels_path,
        )
        if easyocr is None:
            raise RuntimeError(
                "easyocr is required for OCR but is not installed."
            ) from EASYOCR_IMPORT_ERROR
        self.ocr_reader = easyocr.Reader(
            ["en"], gpu=self.classifier.device.type == "cuda", verbose=False
        )

    def available_images(self) -> List[Path]:
        image_dir = self.project_root / "inference_data"
        patterns = ("*.png", "*.jpg", "*.jpeg", "*.bmp", "*.webp")
        files: List[Path] = []
        for pattern in patterns:
            files.extend(image_dir.glob(pattern))
        return sorted(files)

    def analyze_image(self, image_path: Path) -> AnalysisResult:
        source_image = Image.open(image_path).convert("RGB")
        predictions = self.detector.predict(
            source=str(image_path),
            conf=0.25,
            verbose=False,
        )
        boxes = predictions[0].boxes
        detections: List[DetectionResult] = []
        annotated = source_image.copy()
        draw = ImageDraw.Draw(annotated)

        sorted_boxes = sorted(
            boxes.xyxy.tolist(), key=lambda box: (round(box[1] / 40), box[0])
        )
        for box in sorted_boxes:
            x1, y1, x2, y2 = [int(round(value)) for value in box]
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(source_image.width, x2)
            y2 = min(source_image.height, y2)
            if x2 <= x1 or y2 <= y1:
                continue

            crop = source_image.crop((x1, y1, x2, y2))
            model_crop = crop.resize(
                (DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE), Image.Resampling.BILINEAR
            )
            ocr_text = self._extract_text(crop)
            prediction = self.classifier.predict(model_crop, ocr_text)
            bbox = (x1, y1, x2, y2)
            draw.rectangle(bbox, outline="#FF6B35", width=4)
            draw.text((bbox[0] + 6, bbox[1] + 6), prediction.label, fill="#FFF7E8")
            detections.append(
                DetectionResult(
                    bbox=bbox,
                    ocr_text=ocr_text,
                    prediction=prediction,
                    crop_base64=_pil_to_base64(crop),
                )
            )

        counts = Counter(item.prediction.label for item in detections)
        return AnalysisResult(
            image_name=image_path.name,
            image_base64=_pil_to_base64(source_image),
            annotated_base64=_pil_to_base64(annotated),
            detections=detections,
            item_counts=sorted(counts.items(), key=lambda item: (-item[1], item[0])),
        )

    def _extract_text(self, crop: Image.Image) -> str:
        crop_np = np.array(crop)
        raw_tokens = self.ocr_reader.readtext(crop_np, detail=0, paragraph=True)
        return " ".join(token.strip() for token in raw_tokens if token.strip())
