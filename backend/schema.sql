CREATE TABLE service_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    daily_salary DECIMAL(10, 2) NOT NULL,
    allowed_leaves INTEGER NOT NULL,
    contact_number VARCHAR(20),
    upi_id VARCHAR(50)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    service_provider_id INTEGER REFERENCES service_providers(id),
    date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    UNIQUE(service_provider_id, date)
);

-- Insert mock data for service providers
INSERT INTO service_providers (name, role, daily_salary, allowed_leaves, contact_number, upi_id)
VALUES
    ('Aarti', 'Maid', 500.00, 5, '9876543210', 'aarti@upi'),
    ('Rajesh', 'Driver', 700.00, 4, '9876543211', 'rajesh@upi'),
    ('Sunita', 'Cook', 600.00, 5, '9876543212', 'sunita@upi'),
    ('Amit', 'Gardener', 400.00, 3, '9876543213', 'amit@upi'),
    ('Priya', 'Nanny', 800.00, 6, '9876543214', 'priya@upi');

-- Insert mock attendance data for the last 7 days
DO $$
DECLARE
    provider_id INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    FOR provider_id IN SELECT id FROM service_providers LOOP
        FOR i IN 0..6 LOOP
            INSERT INTO attendance (service_provider_id, date, present)
            VALUES (provider_id, current_date - i, random() > 0.3);
        END LOOP;
    END LOOP;
END $$;

