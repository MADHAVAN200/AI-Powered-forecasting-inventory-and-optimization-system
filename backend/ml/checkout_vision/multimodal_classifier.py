import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizerFast


DEFAULT_IMAGE_SIZE = 224
DEFAULT_TEXT_MAX_LEN = 64


class ImageEncoder(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        resnet = models.resnet50(weights=None)
        self.backbone = nn.Sequential(*list(resnet.children())[:-1])

    def forward(self, image: torch.Tensor) -> torch.Tensor:
        return self.backbone(image).flatten(1)


class TextEncoder(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.bert = DistilBertModel(DistilBertConfig())

    def forward(
        self, input_ids: torch.Tensor, attention_mask: torch.Tensor
    ) -> torch.Tensor:
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        return output.last_hidden_state[:, 0, :]


class MultiModalClassifier(nn.Module):
    def __init__(self, num_classes: int) -> None:
        super().__init__()
        self.image_enc = ImageEncoder()
        self.text_enc = TextEncoder()
        self.classifier = nn.Sequential(
            nn.Linear(2048 + 768, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, num_classes),
        )

    def forward(
        self,
        image: torch.Tensor,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        image_features = self.image_enc(image)
        text_features = self.text_enc(input_ids, attention_mask)
        return self.classifier(torch.cat([image_features, text_features], dim=1))


@dataclass(frozen=True)
class Prediction:
    class_id: int
    label: str
    confidence: float


class LabelCatalog:
    def __init__(self, labels_path: Path) -> None:
        with labels_path.open("r", encoding="utf-8") as handle:
            raw_labels = json.load(handle)

        self.by_barcode: Dict[str, Dict[str, object]] = raw_labels
        self.by_class_id: Dict[int, Dict[str, object]] = {}
        for entry in raw_labels.values():
            class_id = int(entry["class_id"])
            self.by_class_id[class_id] = entry

        self.id_to_label: Dict[int, str] = {
            class_id: str(entry["label"])
            for class_id, entry in self.by_class_id.items()
        }

    @property
    def num_classes(self) -> int:
        return len(self.id_to_label)


class MultiModalPredictor:
    def __init__(
        self,
        weights_path: Path,
        labels_path: Path,
        device: str | None = None,
        tokenizer_name: str = "distilbert-base-uncased",
    ) -> None:
        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )
        self.labels = LabelCatalog(labels_path)
        self.model = MultiModalClassifier(self.labels.num_classes)

        state_dict = torch.load(weights_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose(
            [
                transforms.Resize((DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

        self.tokenizer = DistilBertTokenizerFast.from_pretrained(tokenizer_name)

    def predict(self, image: Image.Image, text: str) -> Prediction:
        image_tensor = self.transform(image.convert("RGB")).unsqueeze(0).to(self.device)
        tokens = self.tokenizer(
            text or "",
            padding="max_length",
            truncation=True,
            max_length=DEFAULT_TEXT_MAX_LEN,
            return_tensors="pt",
        )
        input_ids = tokens["input_ids"].to(self.device)
        attention_mask = tokens["attention_mask"].to(self.device)

        with torch.no_grad():
            logits = self.model(image_tensor, input_ids, attention_mask)
            probabilities = torch.softmax(logits, dim=1)
            confidence, class_index = probabilities.max(dim=1)

        class_id = int(class_index.item())
        return Prediction(
            class_id=class_id,
            label=self.labels.id_to_label[class_id],
            confidence=float(confidence.item()),
        )

    def predict_batch(self, items: List[Tuple[Image.Image, str]]) -> List[Prediction]:
        return [self.predict(image=image, text=text) for image, text in items]
