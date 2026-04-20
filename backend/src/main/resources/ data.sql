-- src/main/resources/data.sql
-- Sample data for development

-- Insert sample vet clinics
INSERT INTO vet_clinics (name, specialization, address, phone, email, hours, latitude, longitude, rating, review_count, is_emergency, is_open, services, description, created_at, updated_at)
VALUES
    ('City Animal Hospital', 'General Practice, Surgery', '123 Main Street, Downtown', '+1 (555) 123-4567', 'info@cityanimal.com', '8:00 AM - 8:00 PM', 40.7128, -74.0060, 4.8, 234, true, true, 'General Checkups,Vaccinations,Surgery,Dental Care,Emergency Care,Dermatology,X-Ray', 'Full-service animal hospital with 24/7 emergency care.', NOW(), NOW()),
    ('Pet Care Plus', 'Dermatology, Internal Medicine', '456 Oak Avenue, Midtown', '+1 (555) 234-5678', 'contact@petcareplus.com', '9:00 AM - 6:00 PM', 40.7580, -73.9855, 4.6, 187, false, true, 'Dermatology,Internal Medicine,Allergy Testing,Nutrition Counseling', 'Specialized care for skin conditions and internal medicine.', NOW(), NOW()),
    ('Emergency Vet Clinic', 'Emergency Care, Critical Care', '789 Emergency Lane, Uptown', '+1 (555) 345-6789', 'emergency@vetclinic.com', '24/7', 40.7831, -73.9712, 4.9, 412, true, true, 'Emergency Care,Critical Care,Surgery,Trauma,Toxicology', '24/7 emergency veterinary services for critical cases.', NOW(), NOW()),
    ('Happy Paws Clinic', 'General Practice, Preventive Care', '321 Pet Street, Suburbs', '+1 (555) 456-7890', 'hello@happypaws.com', '8:00 AM - 5:00 PM', 40.7489, -73.9680, 4.5, 156, false, true, 'General Checkups,Vaccinations,Preventive Care,Microchipping', 'Friendly neighborhood vet clinic for routine care.', NOW(), NOW()),
    ('Animal Wellness Center', 'Holistic Medicine, Rehabilitation', '555 Wellness Blvd, Eastside', '+1 (555) 567-8901', 'info@animalwellness.com', '9:00 AM - 7:00 PM', 40.7614, -73.9776, 4.7, 203, false, true, 'Holistic Medicine,Acupuncture,Rehabilitation,Physical Therapy', 'Alternative and holistic veterinary care options.', NOW(), NOW());