# check_breed_labels.py
# run: python check_breed_labels.py

import os
import json

# Check labels.json from your ai_service folder
labels_path = "../PetGuardianApplication-IT24103079/ai_service/labels.json"

if os.path.exists(labels_path):
    with open(labels_path, "r") as f:
        labels = json.load(f)
    print("Labels from labels.json:")
    print(labels)
    print(f"Total classes: {len(labels)}")
else:
    print("labels.json not found at:", labels_path)
    
    # Try current directory
    if os.path.exists("labels.json"):
        with open("labels.json", "r") as f:
            labels = json.load(f)
        print("Labels found in current dir:")
        print(labels)