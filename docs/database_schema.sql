-- Database schema for the OjaPlus business platform configuration engine.
-- Designed for PostgreSQL 15+

CREATE TABLE site_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    eyebrow TEXT,
    body JSONB NOT NULL DEFAULT '[]'::JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (page_id, key)
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video')),
    url TEXT NOT NULL,
    focal_x NUMERIC(5,2) CHECK (focal_x BETWEEN 0 AND 100),
    focal_y NUMERIC(5,2) CHECK (focal_y BETWEEN 0 AND 100),
    alt_text TEXT,
    playback_hints JSONB DEFAULT 'null',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cta_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('overlay', 'route', 'external')),
    target_value TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    tab_id TEXT NOT NULL,
    label TEXT NOT NULL,
    body TEXT NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (page_section_id, tab_id, effective_from)
);

CREATE TABLE contact_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
    option_value TEXT NOT NULL,
    option_label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE site_page_socials (
    page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
    social_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (page_id, social_id)
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    flyer_url TEXT,
    calendar_url TEXT,
    ticket_url TEXT,
    requires_ticket BOOLEAN NOT NULL DEFAULT FALSE,
    hotline TEXT,
    headline_copy JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_headliners (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (event_id, sort_order)
);

CREATE TABLE content_revisions (
    id BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    previous_version JSONB,
    next_version JSONB,
    actor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partner_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    enquiry_type TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_sections_page ON page_sections(page_id);
CREATE INDEX idx_media_assets_section ON media_assets(page_section_id);
CREATE INDEX idx_cta_links_section ON cta_links(page_section_id);
CREATE INDEX idx_legal_documents_section ON legal_documents(page_section_id);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_partner_leads_status ON partner_leads(status);

