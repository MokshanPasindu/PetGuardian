"""
Legacy compatibility wrapper.

The old version of this project generated fake solid-color images per breed.
That dataset has been removed because it cannot teach a real pet classifier.

Use the Oxford-IIIT Pet dataset instead.

Options:
1. Train directly from TFDS with:
      python train_ai.py
2. Or export a real-image folder dataset with:
      python generate_dataset.py

This script downloads Oxford-IIIT Pet via tensorflow_datasets and exports only the
six breeds used by PetGuardian into dataset/train/<breed_name>/.
"""

import json
import shutil
from pathlib import Path

import tensorflow as tf
import tensorflow_datasets as tfds
from PIL import Image

IMG_SIZE = (224, 224)
DATA_DIR = Path(__file__).resolve().parent / 'tfds_data'
OUTPUT_DIR = Path(__file__).resolve().parent / 'dataset' / 'train'
LABELS_FILE = Path(__file__).resolve().parent / 'labels.json'

with open(LABELS_FILE, 'r', encoding='utf-8') as f:
    labels_data = json.load(f)

OXFORD_LABEL_TO_PROJECT_BREED = {
    'beagle': 'Beagle',
    'english_cocker_spaniel': 'English Cocker Spaniel',
    'maine_coon': 'Maine Coon',
    'persian': 'Persian',
    'siamese': 'Siamese',
    'pug': 'Pug',
}


def main():
    builder = tfds.builder('oxford_iiit_pet', data_dir=str(DATA_DIR))
    builder.download_and_prepare()
    ds = tfds.load('oxford_iiit_pet', split='train+test', as_supervised=False, data_dir=str(DATA_DIR))

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    int2str = builder.info.features['label'].int2str
    counts = {breed: 0 for breed in OXFORD_LABEL_TO_PROJECT_BREED.values()}

    for example in tfds.as_numpy(ds):
        tfds_name = int2str(int(example['label']) - 1)
        if tfds_name not in OXFORD_LABEL_TO_PROJECT_BREED:
            continue

        breed_name = OXFORD_LABEL_TO_PROJECT_BREED[tfds_name]
        breed_dir = OUTPUT_DIR / breed_name
        breed_dir.mkdir(parents=True, exist_ok=True)
        image = Image.fromarray(example['image']).resize(IMG_SIZE)
        out_path = breed_dir / f"{breed_name.replace(' ', '_').lower()}_{counts[breed_name]:04d}.jpg"
        image.save(out_path, quality=95)
        counts[breed_name] += 1

    print('Export complete:')
    for breed, count in counts.items():
        print(f'  {breed}: {count} images')
    print(f'Wrote folder dataset to: {OUTPUT_DIR}')


if __name__ == '__main__':
    main()
