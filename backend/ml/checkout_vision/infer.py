import json
import sys
from dataclasses import asdict, is_dataclass
from pathlib import Path

from pipeline import ProductAnalysisPipeline


PROJECT_ROOT = Path(__file__).resolve().parent


def to_jsonable(value):
    if is_dataclass(value):
        return {key: to_jsonable(item) for key, item in asdict(value).items()}
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, list):
        return [to_jsonable(item) for item in value]
    if isinstance(value, tuple):
        return [to_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {key: to_jsonable(item) for key, item in value.items()}
    return value


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Image path is required"}))
        sys.exit(1)

    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(
            json.dumps(
                {"success": False, "error": f"Image not found: {image_path}"}
            )
        )
        sys.exit(1)

    try:
        pipeline = ProductAnalysisPipeline(PROJECT_ROOT)
        result = pipeline.analyze_image(image_path)
        print(json.dumps({"success": True, "data": to_jsonable(result)}))
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
