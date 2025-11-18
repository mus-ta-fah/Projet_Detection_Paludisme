import os
from huggingface_hub import HfApi

HF_TOKEN = os.getenv("HF_TOKEN")
HF_USERNAME = os.getenv("HF_USERNAME")

repo_id = "mugeekwara/malaria-models"

MODELS = [
    ("app/ml/models/alternatives/Model_1_Simple.keras", "Model_1_Simple.keras"),
    ("app/ml/models/production/best_malaria_model.keras", "best_malaria_model.keras"),
    ("app/ml/models/alternatives/Model_3_Deep_VGG.keras", "Model_3_Deep_VGG.keras"),
]

api = HfApi()

for local_path, remote_name in MODELS:
    print(f"⏫ Upload : {remote_name}")
    # hf_hub_upload(
    #     repo_id=repo_id,
    #     token=HF_TOKEN,
    #     path_or_fileobj=local_path,
    #     path_in_repo=remote_name,
    # )

    api.upload_file(
        path_or_fileobj=local_path,
        path_in_repo=remote_name,
        repo_id=repo_id,
        repo_type="model",
    )


print("✨ Tous les modèles ont été uploadés avec succès.")
