import os
import yaml
from pathlib import Path
import tensorflow as tf

from huggingface_hub import hf_hub_download

BASE_DIR = Path(__file__).parent
CONFIG_PATH = BASE_DIR / "model_config.yaml"
CACHE_DIR = BASE_DIR / "cache" / "downloaded"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


def _download_from_huggingface(url, local_path):
    parts = url.split("/")
    repo_id = f"{parts[3]}/{parts[4]}"
    filename = parts[-1]

    return hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=str(Path(local_path).parent)
    )


def download_model_if_needed(model_info):
    local_path = model_info["local_path"]

    if os.path.exists(local_path):
        return local_path

    print(f"Téléchargement du modèle : {model_info['name']}")

    if model_info["remote"] == "huggingface":
        _download_from_huggingface(model_info["url"], local_path)
    else:
        raise ValueError(f"Remote inconnu : {model_info['remote']}")

    return local_path


def load_model(model_info):
    local_path = download_model_if_needed(model_info)

    if model_info["format"] == "keras":
        return tf.keras.models.load_model(local_path)

    if model_info["format"] == "saved_model":
        return tf.saved_model.load(local_path)

    raise ValueError(f"Format inconnu : {model_info['format']}")
