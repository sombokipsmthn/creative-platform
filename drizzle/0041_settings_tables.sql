-- Workspace branding settings
CREATE TABLE IF NOT EXISTS creator_workspace_branding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    custom_domain TEXT,
    hide_platform_branding BOOLEAN DEFAULT TRUE NOT NULL,
    header_logo_url TEXT,
    favicon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id)
);

-- Email templates
CREATE TABLE IF NOT EXISTS creator_email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_subject TEXT DEFAULT 'Your Private Client Gallery is Ready — KIPSMTHN',
    invitation_body TEXT DEFAULT 'Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}',
    reminder_subject TEXT DEFAULT 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days',
    reminder_body TEXT DEFAULT 'Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id)
);

-- Creator notification preferences
CREATE TABLE IF NOT EXISTS creator_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gallery_selections BOOLEAN DEFAULT TRUE NOT NULL,
    gallery_comments BOOLEAN DEFAULT TRUE NOT NULL,
    gallery_shares BOOLEAN DEFAULT TRUE NOT NULL,
    gallery_approvals BOOLEAN DEFAULT TRUE NOT NULL,
    contract_signed BOOLEAN DEFAULT TRUE NOT NULL,
    contract_viewed BOOLEAN DEFAULT TRUE NOT NULL,
    contract_declined BOOLEAN DEFAULT TRUE NOT NULL,
    invoice_paid BOOLEAN DEFAULT TRUE NOT NULL,
    invoice_overdue BOOLEAN DEFAULT TRUE NOT NULL,
    payment_received BOOLEAN DEFAULT TRUE NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    in_app_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id)
);

-- Integrations
CREATE TABLE IF NOT EXISTS creator_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    integration_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'inactive' NOT NULL,
    config JSONB DEFAULT '{}',
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, integration_key)
);

-- Gallery default settings (workspace-level defaults for new galleries)
CREATE TABLE IF NOT EXISTS creator_gallery_defaults (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_photo_selection_limit INTEGER DEFAULT 25 NOT NULL,
    default_expiration_days INTEGER DEFAULT 60 NOT NULL,
    default_master_pin TEXT DEFAULT '4821',
    default_allow_downloads BOOLEAN DEFAULT TRUE NOT NULL,
    default_allow_favorites BOOLEAN DEFAULT TRUE NOT NULL,
    default_allow_selections BOOLEAN DEFAULT TRUE NOT NULL,
    default_require_pin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (user_id)
);

-- Update creator_business_profiles to add VAT registration details
ALTER TABLE creator_business_profiles 
ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 50 NOT NULL,
ADD COLUMN IF NOT EXISTS wht_rate INTEGER DEFAULT 0 NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_creator_workspace_branding_user_id ON creator_workspace_branding(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_email_templates_user_id ON creator_email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_notification_preferences_user_id ON creator_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_integrations_user_id ON creator_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_gallery_defaults_user_id ON creator_gallery_defaults(user_id);
