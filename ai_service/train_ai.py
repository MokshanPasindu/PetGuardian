import json
import logging
import os
from pathlib import Path

import tensorflow as tf
import tensorflow_datasets as tfds
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D, Input
from tensorflow.keras.models import Model

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

IMG_SIZE = (224, 224)
BATCH_SIZE = int(os.environ.get('BATCH_SIZE', 32))
EPOCHS_HEAD = int(os.environ.get('EPOCHS_HEAD', 6))
EPOCHS_FINETUNE = int(os.environ.get('EPOCHS_FINETUNE', 8))
AUTOTUNE = tf.data.AUTOTUNE
SEED = 42
DATA_DIR = os.environ.get('TFDS_DATA_DIR', str(Path(__file__).resolve().parent / 'tfds_data'))
CHECKPOINT_DIR = Path(__file__).resolve().parent / 'checkpoints'
EXPORT_DIR = Path(__file__).resolve().parent.parent / 'pet_breed_category_classifier'
LABELS_FILE = Path(__file__).resolve().parent / 'labels.json'

with open(LABELS_FILE, 'r', encoding='utf-8') as f:
    labels_data = json.load(f)

BREEDS = labels_data['breed_labels']
CATEGORIES = labels_data['category_labels']
BREED_TO_CATEGORY = labels_data['breed_to_category']

breed_to_idx = {breed: idx for idx, breed in enumerate(BREEDS)}
cat_to_idx = {cat: idx for idx, cat in enumerate(CATEGORIES)}

# Oxford-IIIT Pet labels are 1-indexed and use underscores.
OXFORD_LABEL_TO_PROJECT_BREED = {
    'beagle': 'Beagle',
    'english_cocker_spaniel': 'English Cocker Spaniel',
    'maine_coon': 'Maine Coon',
    'persian': 'Persian',
    'siamese': 'Siamese',
    'pug': 'Pug',
}
TARGET_OXFORD_LABELS = set(OXFORD_LABEL_TO_PROJECT_BREED.keys())

logger.info('Training breeds: %s', BREEDS)
logger.info('Training categories: %s', CATEGORIES)
logger.info('Using TFDS data directory: %s', DATA_DIR)


def build_label_lookup():
    info = tfds.builder('oxford_iiit_pet', data_dir=DATA_DIR).info
    int2str = info.features['label'].int2str
    lookup = {}
    for idx in range(info.features['label'].num_classes):
        tfds_name = int2str(idx)
        if tfds_name in OXFORD_LABEL_TO_PROJECT_BREED:
            lookup[idx + 1] = OXFORD_LABEL_TO_PROJECT_BREED[tfds_name]
    logger.info('Matched Oxford-IIIT Pet labels: %s', sorted(lookup.values()))
    return lookup


def filter_target_breeds(example, label_lookup):
    valid_label_ids = tf.constant(sorted(label_lookup.keys()), dtype=tf.int64)
    return tf.reduce_any(tf.equal(example['label'], valid_label_ids))


def make_targets(project_breed):
    breed_index = tf.constant(breed_to_idx[project_breed.numpy().decode('utf-8')], dtype=tf.int32)
    category_name = BREED_TO_CATEGORY[project_breed.numpy().decode('utf-8')]
    category_index = tf.constant(cat_to_idx[category_name], dtype=tf.int32)
    return breed_index, category_index


def decode_targets(project_breed):
    breed_idx, cat_idx = tf.py_function(
        func=make_targets,
        inp=[project_breed],
        Tout=[tf.int32, tf.int32],
    )
    breed_idx.set_shape([])
    cat_idx.set_shape([])
    return breed_idx, cat_idx


def preprocess_example(example, label_lookup, augment=False):
    image = tf.image.resize(example['image'], IMG_SIZE)
    image = tf.cast(image, tf.float32)
    if augment:
        image = data_augmentation(image, training=True)
    image = preprocess_input(image)

    project_breed = tf.py_function(
        func=lambda label: label_lookup[int(label.numpy())].encode('utf-8'),
        inp=[example['label']],
        Tout=tf.string,
    )
    project_breed.set_shape([])
    breed_idx, cat_idx = decode_targets(project_breed)

    targets = {
        'breed_output': tf.one_hot(breed_idx, depth=len(BREEDS)),
        'cat_output': tf.one_hot(cat_idx, depth=len(CATEGORIES)),
    }
    return image, targets


# Kept intentionally light because Oxford-IIIT Pet is not huge.
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip('horizontal'),
    layers.RandomRotation(0.05),
    layers.RandomZoom(0.1),
    layers.RandomContrast(0.1),
], name='data_augmentation')


def build_datasets():
    label_lookup = build_label_lookup()
    if len(label_lookup) != len(BREEDS):
        missing = set(BREEDS) - set(label_lookup.values())
        raise RuntimeError(f'Missing target breeds in Oxford-IIIT Pet: {sorted(missing)}')

    train_raw, val_raw = tfds.load(
        'oxford_iiit_pet',
        split=['train[:80%]', 'train[80%:]'],
        shuffle_files=True,
        as_supervised=False,
        with_info=False,
        data_dir=DATA_DIR,
    )

    train_raw = train_raw.filter(lambda x: filter_target_breeds(x, label_lookup))
    val_raw = val_raw.filter(lambda x: filter_target_breeds(x, label_lookup))

    train_ds = (
        train_raw
        .shuffle(2048, seed=SEED, reshuffle_each_iteration=True)
        .map(lambda x: preprocess_example(x, label_lookup, augment=True), num_parallel_calls=AUTOTUNE)
        .batch(BATCH_SIZE)
        .prefetch(AUTOTUNE)
    )

    val_ds = (
        val_raw
        .map(lambda x: preprocess_example(x, label_lookup, augment=False), num_parallel_calls=AUTOTUNE)
        .batch(BATCH_SIZE)
        .prefetch(AUTOTUNE)
    )

    train_count = int(train_raw.reduce(tf.constant(0), lambda x, _: x + 1).numpy())
    val_count = int(val_raw.reduce(tf.constant(0), lambda x, _: x + 1).numpy())
    logger.info('Filtered training examples: %d', train_count)
    logger.info('Filtered validation examples: %d', val_count)
    if train_count == 0 or val_count == 0:
        raise RuntimeError('No training data remained after filtering target breeds.')

    return train_ds, val_ds


def build_model():
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(*IMG_SIZE, 3))
    base_model.trainable = False

    inputs = Input(shape=(*IMG_SIZE, 3), name='image')
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)

    breed_output = Dense(len(BREEDS), activation='softmax', name='breed_output')(x)
    cat_output = Dense(len(CATEGORIES), activation='softmax', name='cat_output')(x)

    model = Model(inputs=inputs, outputs=[breed_output, cat_output])
    return model, base_model


def compile_model(model, learning_rate):
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss={
            'breed_output': 'categorical_crossentropy',
            'cat_output': 'categorical_crossentropy',
        },
        metrics={
            'breed_output': ['accuracy'],
            'cat_output': ['accuracy'],
        },
    )


def main():
    train_ds, val_ds = build_datasets()
    model, base_model = build_model()

    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=2, min_lr=1e-6),
        ModelCheckpoint(
            filepath=str(CHECKPOINT_DIR / 'best_model.keras'),
            monitor='val_loss',
            save_best_only=True,
        ),
    ]

    logger.info('Training classification heads for %d epochs...', EPOCHS_HEAD)
    compile_model(model, learning_rate=1e-3)
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD, callbacks=callbacks)

    logger.info('Fine-tuning top MobileNetV2 layers for %d epochs...', EPOCHS_FINETUNE)
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    compile_model(model, learning_rate=1e-5)
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_FINETUNE, callbacks=callbacks)

    logger.info('Exporting SavedModel to %s', EXPORT_DIR)
    tf.saved_model.save(model, str(EXPORT_DIR))
    logger.info('Training complete. SavedModel exported successfully.')


if __name__ == '__main__':
    main()
