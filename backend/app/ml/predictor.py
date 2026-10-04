from transformers import pipeline
import threading

try:
    import torch  # optional dependency for heavier installs
except Exception:
    torch = None


class TomatoPredictor:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(TomatoPredictor, cls).__new__(cls)
                    cls._instance.classifier = None
        return cls._instance

    def _ensure_loaded(self):
        if self.classifier is not None:
            return

        if torch is None:
            raise RuntimeError(
                "Model pipeline unavailable: install torch to enable predictions."
            )

        self.classifier = pipeline(
            "image-classification",
            model="nexusbert/tomato-disease-vit"
        )

    def predict(self, image_path: str):
        self._ensure_loaded()
        # results is a list of dicts: [{"label": "...", "score": ...}, ...]
        results = self.classifier(image_path)
        return results[0]  # Top prediction
