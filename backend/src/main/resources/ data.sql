-- src/main/resources/data.sql
-- Add these vet clinic records so you have data to work with

INSERT INTO vet_clinics (
  name, specialization, address, phone, email, hours, image,
  latitude, longitude, rating, review_count,
  is_emergency, is_open, services, description,
  created_at, updated_at
)
SELECT * FROM (
  SELECT
    'City Animal Hospital' as name,
    'General Practice, Surgery' as specialization,
    '123 Main Street, Downtown' as address,
    '+1 (555) 123-4567' as phone,
    'info@cityanimal.com' as email,
    'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM' as hours,
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=200&fit=crop' as image,
    3.1390 as latitude,
    101.6869 as longitude,
    4.8 as rating,
    234 as review_count,
    true as is_emergency,
    true as is_open,
    'General Checkups,Vaccinations,Surgery,Dental Care,Emergency Care,X-Ray' as services,
    'Full-service animal hospital providing comprehensive veterinary care.' as description,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM vet_clinics WHERE name = 'City Animal Hospital'
);

INSERT INTO vet_clinics (
  name, specialization, address, phone, email, hours, image,
  latitude, longitude, rating, review_count,
  is_emergency, is_open, services, description,
  created_at, updated_at
)
SELECT * FROM (
  SELECT
    'Pet Care Plus Clinic' as name,
    'Dermatology, Internal Medicine' as specialization,
    '456 Oak Avenue, Midtown' as address,
    '+1 (555) 234-5678' as phone,
    'care@petcareplus.com' as email,
    'Mon-Sat: 9AM-6PM' as hours,
    'https://images.unsplash.com/photo-1628009368231-7bb7cf24da27?w=400&h=200&fit=crop' as image,
    3.1480 as latitude,
    101.6950 as longitude,
    4.6 as rating,
    187 as review_count,
    false as is_emergency,
    true as is_open,
    'Dermatology,Internal Medicine,Vaccinations,Dental Care,Laboratory' as services,
    'Specialized veterinary clinic focusing on skin conditions and internal medicine.' as description,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM vet_clinics WHERE name = 'Pet Care Plus Clinic'
);

INSERT INTO vet_clinics (
  name, specialization, address, phone, email, hours, image,
  latitude, longitude, rating, review_count,
  is_emergency, is_open, services, description,
  created_at, updated_at
)
SELECT * FROM (
  SELECT
    '24/7 Emergency Vet Center' as name,
    'Emergency Care, Critical Care, ICU' as specialization,
    '789 Emergency Lane, Uptown' as address,
    '+1 (555) 345-6789' as phone,
    'emergency@vetcenter.com' as email,
    '24 Hours / 7 Days a Week' as hours,
    'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400&h=200&fit=crop' as image,
    3.1570 as latitude,
    101.7120 as longitude,
    4.9 as rating,
    412 as review_count,
    true as is_emergency,
    true as is_open,
    'Emergency Care,Critical Care,ICU,Surgery,Blood Transfusion,Oxygen Therapy' as services,
    'Round-the-clock emergency veterinary services for critical cases.' as description,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM vet_clinics WHERE name = '24/7 Emergency Vet Center'
);

INSERT INTO vet_clinics (
  name, specialization, address, phone, email, hours, image,
  latitude, longitude, rating, review_count,
  is_emergency, is_open, services, description,
  created_at, updated_at
)
SELECT * FROM (
  SELECT
    'Happy Paws Veterinary' as name,
    'General Practice, Exotic Animals' as specialization,
    '321 Paws Street, Eastside' as address,
    '+1 (555) 456-7890' as phone,
    'hello@happypaws.com' as email,
    'Mon-Fri: 9AM-7PM, Sat: 10AM-4PM' as hours,
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop' as image,
    3.1320 as latitude,
    101.6780 as longitude,
    4.7 as rating,
    156 as review_count,
    false as is_emergency,
    true as is_open,
    'General Checkups,Exotic Animals,Vaccinations,Grooming,Microchipping' as services,
    'Friendly neighborhood vet clinic specializing in all types of pets.' as description,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM vet_clinics WHERE name = 'Happy Paws Veterinary'
);

INSERT INTO vet_clinics (
  name, specialization, address, phone, email, hours, image,
  latitude, longitude, rating, review_count,
  is_emergency, is_open, services, description,
  created_at, updated_at
)
SELECT * FROM (
  SELECT
    'Advanced Animal Medical Center' as name,
    'Oncology, Cardiology, Neurology' as specialization,
    '555 Medical Drive, Westside' as address,
    '+1 (555) 567-8901' as phone,
    'info@advancedanimal.com' as email,
    'Mon-Fri: 8AM-6PM' as hours,
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=200&fit=crop' as image,
    3.1250 as latitude,
    101.6650 as longitude,
    4.5 as rating,
    89 as review_count,
    false as is_emergency,
    true as is_open,
    'Oncology,Cardiology,Neurology,MRI,CT Scan,Specialist Consultations' as services,
    'Specialized medical center offering advanced diagnostic and treatment services.' as description,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM vet_clinics WHERE name = 'Advanced Animal Medical Center'
);