-- FinTech ESCROW Database Initialization Script
-- This script sets up the initial database structure and sample data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fintech_escrow;

-- Use the database
\c fintech_escrow;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'advisor', 'seller', 'buyer', 'broker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending_verification', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM (
        'pending_agreement', 'pending_payment', 'payment_received', 
        'item_shipped', 'item_delivered', 'inspection_period', 
        'buyer_approved', 'seller_approved', 'funds_released', 
        'transaction_completed', 'disputed', 'cancelled', 'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM ('vehicle', 'machinery', 'electronics', 'real_estate', 'jewelry', 'art', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('pickup', 'shipping', 'meetup', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'debit_card', 'wire_transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE currency AS ENUM ('MXN', 'USD', 'EUR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Profile information
    role user_role DEFAULT 'buyer' NOT NULL,
    status user_status DEFAULT 'pending_verification' NOT NULL,
    
    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'México',
    
    -- Verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    
    -- KYC/AML data
    curp VARCHAR(18) UNIQUE,
    rfc VARCHAR(13) UNIQUE,
    ine_number VARCHAR(20) UNIQUE,
    
    -- Financial information
    monthly_income INTEGER,
    credit_score INTEGER,
    employment_status VARCHAR(50),
    
    -- Biometric data (for future implementation)
    biometric_data JSONB,
    
    -- Notification preferences
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true, "whatsapp": false}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Document information
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Verification status
    status VARCHAR(20) DEFAULT 'pending',
    verification_notes TEXT,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create escrow_transactions table
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Parties involved
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    supervisor_id INTEGER REFERENCES users(id),
    
    -- Item information
    item_title VARCHAR(200) NOT NULL,
    item_description TEXT NOT NULL,
    item_category item_category NOT NULL,
    item_condition item_condition NOT NULL,
    item_estimated_value DECIMAL(15,2) NOT NULL,
    item_images JSONB DEFAULT '[]',
    
    -- Transaction terms
    price DECIMAL(15,2) NOT NULL,
    currency currency DEFAULT 'MXN' NOT NULL,
    escrow_fee DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    delivery_method delivery_method NOT NULL,
    delivery_address JSONB,
    delivery_date TIMESTAMP WITH TIME ZONE,
    inspection_period_days INTEGER DEFAULT 3 NOT NULL,
    
    -- Transaction status
    status escrow_status DEFAULT 'pending_agreement' NOT NULL,
    
    -- Important dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agreement_date TIMESTAMP WITH TIME ZONE,
    payment_date TIMESTAMP WITH TIME ZONE,
    shipping_date TIMESTAMP WITH TIME ZONE,
    inspection_start_date TIMESTAMP WITH TIME ZONE,
    inspection_end_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment information
    payment_method payment_method,
    payment_transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_processed_at TIMESTAMP WITH TIME ZONE,
    payment_refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Evidence and documentation
    shipping_evidence JSONB DEFAULT '{}',
    inspection_evidence JSONB DEFAULT '{}',
    documents JSONB DEFAULT '[]',
    
    -- Communication
    messages JSONB DEFAULT '[]',
    
    -- Dispute information
    dispute_info JSONB DEFAULT '{}',
    
    -- Notification preferences
    notification_preferences JSONB DEFAULT '{}',
    
    -- Metadata
    source VARCHAR(20) DEFAULT 'web',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- KYC/AML flags
    kyc_flags JSONB DEFAULT '{}'
);

-- Create escrow_messages table
CREATE TABLE IF NOT EXISTS escrow_messages (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escrow_disputes table
CREATE TABLE IF NOT EXISTS escrow_disputes (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
    initiated_by_id INTEGER NOT NULL REFERENCES users(id),
    
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    
    resolution TEXT,
    resolved_by_id INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_curp ON users(curp);
CREATE INDEX IF NOT EXISTS idx_users_rfc ON users(rfc);
CREATE INDEX IF NOT EXISTS idx_users_ine ON users(ine_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_escrow_transaction_id ON escrow_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_id ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_category ON escrow_transactions(item_category);
CREATE INDEX IF NOT EXISTS idx_escrow_created_at ON escrow_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_escrow_messages_transaction_id ON escrow_messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_messages_sender_id ON escrow_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_escrow_disputes_transaction_id ON escrow_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_status ON escrow_disputes(status);

-- Insert sample admin user
INSERT INTO users (
    email, first_name, last_name, hashed_password, role, status,
    is_email_verified, is_phone_verified, is_identity_verified, is_kyc_verified
) VALUES (
    'admin@fintech-escrow.com',
    'Admin',
    'User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.8.8.8.8', -- password: admin123
    'admin',
    'active',
    TRUE, TRUE, TRUE, TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert sample users for testing
INSERT INTO users (
    email, first_name, last_name, hashed_password, role, status,
    is_email_verified, is_phone_verified, is_identity_verified, is_kyc_verified,
    curp, rfc, phone
) VALUES 
(
    'buyer@example.com',
    'Juan',
    'Pérez',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.8.8.8.8', -- password: buyer123
    'buyer',
    'active',
    TRUE, TRUE, TRUE, TRUE,
    'PERJ800101HDFRXN01',
    'PERJ800101ABC',
    '+525512345678'
),
(
    'seller@example.com',
    'María',
    'González',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.8.8.8.8', -- password: seller123
    'seller',
    'active',
    TRUE, TRUE, TRUE, TRUE,
    'GONM800201MDFRXR02',
    'GONM800201DEF',
    '+525512345679'
) ON CONFLICT (email) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate transaction IDs
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ESC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate transaction IDs
CREATE OR REPLACE FUNCTION set_transaction_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_id IS NULL OR NEW.transaction_id = '' THEN
        NEW.transaction_id := generate_transaction_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_escrow_transaction_id BEFORE INSERT ON escrow_transactions
    FOR EACH ROW EXECUTE FUNCTION set_transaction_id();

-- Create a function to calculate escrow fees
CREATE OR REPLACE FUNCTION calculate_escrow_fee(price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(price * 0.025, 2);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-calculate total amount
CREATE OR REPLACE FUNCTION set_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.escrow_fee := calculate_escrow_fee(NEW.price);
    NEW.total_amount := NEW.price + NEW.escrow_fee;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_escrow_total_amount BEFORE INSERT OR UPDATE ON escrow_transactions
    FOR EACH ROW EXECUTE FUNCTION set_total_amount();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fintech_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fintech_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fintech_user;
