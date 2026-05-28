-- creating main table (patient)
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/*
Creating Visit(appointment/encounter) table
visits (each patient can have many visits)
*/

CREATE TABLE IF NOT EXISTS visit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_type ENUM('checkup', 'emergency', 'follow-up', 'consultation') NOT NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_visit_date (visit_date)
);

/*
Create Vitals(measurments at each visit)
vitals (each visit can have many vitals measurements)
*/
CREATE TABLE IF NOT EXISTS vitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    temperature DECIMAL(4, 1),
    weight DECIMAL(5, 2),
    height DECIMAL(5, 2),
    oxygen_saturation INT,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES vists(id) ON DELETE CASCADE,
    INDEX idx_visit_id (visit_id),
    INDEX idx_recorded_at (recorded_at)
);

-- Add a test patient
-- Add a test patient
INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email)
VALUES ('John', 'Doe', '1980-05-15', 'Male', '555-0101', 'john.doe@example.com');

INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email)
VALUES ('Jane', 'Smith', '1992-08-22', 'Female', '555-0102', 'jane.smith@example.com');

-- Add a visit for John Doe
INSERT INTO visits (patient_id, visit_date, visit_type, chief_complaint, diagnosis)
VALUES (1, CURDATE(), 'Checkup', 'Annual physical examination', 'Healthy, no issues found');

-- Add vitals for that visit
INSERT INTO vitals (visit_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height)
VALUES (1, 120, 80, 72, 98.6, 75.5, 175.0);