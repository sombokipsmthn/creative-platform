-- Create contracts table
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  creator_id text not null references users(id) on delete cascade,
  client_id text not null references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  template_id uuid references contract_templates(id) on delete set null,
  title text not null,
  contract_number text not null unique,
  status text not null default 'draft',
  content text not null,
  currency text default 'KES',
  total_amount integer,
  token text not null unique,
  expires_at timestamp,
  sent_at timestamp,
  viewed_at timestamp,
  signed_at timestamp,
  declined_at timestamp,
  cancelled_at timestamp,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);

-- Create contract_templates table
create table if not exists contract_templates (
  id uuid primary key default gen_random_uuid(),
  creator_id text references users(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  document_type text not null,
  content text not null,
  variables jsonb default '[]' not null,
  is_system_template boolean default false not null,
  is_active boolean default true not null,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);

-- Create contract_events table
create table if not exists contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id) on delete cascade,
  event_type text not null,
  metadata jsonb default '{}' not null,
  created_at timestamp default now() not null
);

-- Create indexes for performance
create index if not exists contracts_creator_id_idx on contracts(creator_id);
create index if not exists contracts_client_id_idx on contracts(client_id);
create index if not exists contracts_project_id_idx on contracts(project_id);
create index if not exists contracts_quote_id_idx on contracts(quote_id);
create index if not exists contracts_template_id_idx on contracts(template_id);
create index if not exists contracts_status_idx on contracts(status);
create index if not exists contracts_token_idx on contracts(token);
create index if not exists contract_templates_creator_id_idx on contract_templates(creator_id);
create index if not exists contract_templates_is_system_template_idx on contract_templates(is_system_template);
create index if not exists contract_events_contract_id_idx on contract_events(contract_id);
