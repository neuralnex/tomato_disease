from transformers import pipeline

try:
    import torch  # optional dependency for heavier installs
except Exception:
    torch = None


class TomatoPredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TomatoPredictor, cls).__new__(cls)
            # If torch isn't available, avoid loading the model pipeline now.
            if torch is None:
                cls._instance.classifier = None
            else:
                cls._instance.classifier = pipeline(
                    "image-classification",
                    model="nexusbert/tomato-disease-vit"
                )
        return cls._instance

    def predict(self, image_path: str):
        if self.classifier is None:
            raise RuntimeError(
                "Model pipeline unavailable: install torch to enable predictions."
            )
        # results is a list of dicts: [{"label": "...", "score": ...}, ...]
        results = self.classifier(image_path)
        return results[0]  # Top prediction
