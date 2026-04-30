# Real Training Pipeline

This AI service now trains on real pet photos from the Oxford-IIIT Pet dataset instead of synthetic solid-color images.

## Covered breeds
- Beagle
- English Cocker Spaniel
- Maine Coon
- Persian
- Siamese
- Pug

## Install
```bash
pip install -r requirements.txt
```

## Train directly from TFDS
```bash
python train_ai.py
```

Optional environment variables:
```bash
BATCH_SIZE=32
EPOCHS_HEAD=6
EPOCHS_FINETUNE=8
TFDS_DATA_DIR=./tfds_data
```

The script will:
1. download Oxford-IIIT Pet through `tensorflow_datasets`
2. filter it to the six supported breeds
3. train a dual-head model for breed and pet type
4. export a SavedModel to `../pet_breed_category_classifier`

## Export a real-image folder dataset
If you still want a folder-based dataset under `dataset/train/<breed>/`, run:
```bash
python generate_dataset.py
```

## Important note
The first training run requires internet access so TFDS can download Oxford-IIIT Pet.
