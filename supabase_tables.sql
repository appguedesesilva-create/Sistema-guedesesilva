CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS lawyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  oab VARCHAR(50),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  person_type VARCHAR(10) DEFAULT 'PF',
  name VARCHAR(255),
  cpf VARCHAR(20),
  rg VARCHAR(20),
  rg_expedition_date DATE,
  rg_issuer VARCHAR(50),
  birth_date DATE,
  mother_name VARCHAR(255),
  ctps VARCHAR(50),
  voter_title VARCHAR(50),
  pis VARCHAR(50),
  nis VARCHAR(50),
  profession VARCHAR(100),
  govbr_password VARCHAR(255),
  nationality VARCHAR(100) DEFAULT 'Brasileiro(a)',
  marital_status VARCHAR(50),
  razao_social VARCHAR(255),
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(25),
  inscricao_estadual VARCHAR(50),
  natureza_juridica VARCHAR(100),
  socios JSONB DEFAULT '[]',
  email VARCHAR(255),
  phone VARCHAR(50),
  phone_mobile VARCHAR(50),
  phone_home VARCHAR(50),
  phone_work VARCHAR(50),
  whatsapp VARCHAR(50),
  cep VARCHAR(15),
  address TEXT,
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(5),
  bank_accounts JSONB DEFAULT '[]',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  number VARCHAR(50),
  type VARCHAR(50),
  subject TEXT,
  description TEXT,
  court VARCHAR(255),
  jurisdiction VARCHAR(255),
  instance VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  value DECIMAL(15,2),
  client_name VARCHAR(255),
  opposing_party VARCHAR(255),
  responsible_lawyer VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  process_id UUID,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  client_name VARCHAR(255),
  process_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  name VARCHAR(255),
  type VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  organization VARCHAR(255),
  position VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  process_id UUID,
  title VARCHAR(255),
  type VARCHAR(50),
  category VARCHAR(100),
  content TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  variables JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT FALSE,
  client_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  process_id UUID,
  subject VARCHAR(255),
  description TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'scheduled',
  client_name VARCHAR(255),
  google_event_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  process_id UUID,
  title VARCHAR(255),
  type VARCHAR(50),
  value DECIMAL(15,2),
  payment_type VARCHAR(50),
  installments INTEGER DEFAULT 1,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  client_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  contract_id UUID,
  description VARCHAR(255),
  amount DECIMAL(15,2),
  due_date DATE,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  installment_number INTEGER,
  client_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  client_id UUID,
  process_id UUID,
  description VARCHAR(255),
  category VARCHAR(100),
  amount DECIMAL(15,2),
  date DATE,
  status VARCHAR(50) DEFAULT 'paid',
  payment_method VARCHAR(50),
  client_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID,
  process_id UUID,
  title VARCHAR(255),
  content TEXT,
  source VARCHAR(100),
  publication_date DATE,
  process_number VARCHAR(50),
  court VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
