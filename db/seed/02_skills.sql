-- =============================================================================
-- Seed: Top skills for Panamá market (technical + soft + tools + languages)
-- ESCO/O*NET-aligned. Embeddings populated by the AI pipeline later.
-- =============================================================================

insert into skills_taxonomy (slug, name_en, name_es, category, aliases) values
  -- Tech
  ('python',        'Python',                'Python',                  'tech',     '{python3,py}'),
  ('javascript',    'JavaScript',            'JavaScript',              'tech',     '{js,ecmascript}'),
  ('typescript',    'TypeScript',            'TypeScript',              'tech',     '{ts}'),
  ('react',         'React',                 'React',                   'tech',     '{reactjs,react.js}'),
  ('nextjs',        'Next.js',               'Next.js',                 'tech',     '{next}'),
  ('nodejs',        'Node.js',               'Node.js',                 'tech',     '{node}'),
  ('java',          'Java',                  'Java',                    'tech',     '{}'),
  ('csharp',        'C#',                    'C#',                      'tech',     '{c-sharp,dotnet}'),
  ('php',           'PHP',                   'PHP',                     'tech',     '{}'),
  ('sql',           'SQL',                   'SQL',                     'tech',     '{plsql,tsql}'),
  ('postgresql',    'PostgreSQL',            'PostgreSQL',              'tech',     '{postgres,psql}'),
  ('mysql',         'MySQL',                 'MySQL',                   'tech',     '{}'),
  ('mongodb',       'MongoDB',               'MongoDB',                 'tech',     '{mongo}'),
  ('aws',           'AWS',                   'AWS',                     'tech',     '{amazon-web-services}'),
  ('azure',         'Azure',                 'Azure',                   'tech',     '{microsoft-azure}'),
  ('gcp',           'Google Cloud',          'Google Cloud',            'tech',     '{gcp}'),
  ('docker',        'Docker',                'Docker',                  'tech',     '{}'),
  ('kubernetes',    'Kubernetes',            'Kubernetes',              'tech',     '{k8s}'),
  ('git',           'Git',                   'Git',                     'tech',     '{github,gitlab}'),

  -- Office / Admin tools
  ('excel',         'Microsoft Excel',       'Microsoft Excel',         'tool',     '{excel-avanzado,vlookup}'),
  ('word',          'Microsoft Word',        'Microsoft Word',          'tool',     '{}'),
  ('powerpoint',    'PowerPoint',            'PowerPoint',              'tool',     '{}'),
  ('outlook',       'Outlook',               'Outlook',                 'tool',     '{}'),
  ('google_workspace','Google Workspace',    'Google Workspace',        'tool',     '{gsuite,google-docs,google-sheets}'),

  -- Banking / Finance
  ('sap',           'SAP',                   'SAP',                     'tool',     '{sap-fi,sap-mm}'),
  ('quickbooks',    'QuickBooks',            'QuickBooks',              'tool',     '{}'),
  ('contabilidad',  'Accounting',            'Contabilidad',            'soft',     '{contable}'),
  ('niif',          'IFRS Standards',        'NIIF',                    'soft',     '{ifrs}'),
  ('aml',           'AML / Compliance',      'Cumplimiento / AML',      'soft',     '{compliance}'),
  ('credit_analysis','Credit Analysis',      'Análisis de crédito',     'soft',     '{}'),

  -- Sales / Customer service
  ('sales',         'Sales',                 'Ventas',                  'soft',     '{}'),
  ('cold_calling',  'Cold calling',          'Llamadas en frío',        'soft',     '{}'),
  ('crm',           'CRM',                   'CRM',                     'tool',     '{salesforce,hubspot}'),
  ('customer_service','Customer Service',    'Atención al cliente',     'soft',     '{servicio-al-cliente}'),
  ('pos',           'POS Systems',           'Sistemas POS',            'tool',     '{punto-de-venta}'),

  -- Logistics
  ('warehouse',     'Warehouse Management',  'Gestión de almacén',      'soft',     '{}'),
  ('forklift',      'Forklift Operation',    'Operación de montacargas','tool',     '{montacargas}'),
  ('logistics',     'Logistics',             'Logística',               'soft',     '{}'),

  -- Bilingüe
  ('lang_en_b1',    'English B1',            'Inglés B1',               'language', '{}'),
  ('lang_en_b2',    'English B2',            'Inglés B2',               'language', '{}'),
  ('lang_en_c1',    'English C1',            'Inglés C1',               'language', '{}'),
  ('lang_en_native','English Native',        'Inglés Nativo',           'language', '{}'),
  ('lang_pt',       'Portuguese',            'Portugués',               'language', '{}'),
  ('lang_zh',       'Mandarin',              'Mandarín',                'language', '{}'),

  -- Soft skills
  ('communication', 'Communication',         'Comunicación',            'soft',     '{}'),
  ('teamwork',      'Teamwork',              'Trabajo en equipo',       'soft',     '{}'),
  ('leadership',    'Leadership',            'Liderazgo',               'soft',     '{}'),
  ('problem_solving','Problem Solving',      'Resolución de problemas', 'soft',     '{}'),
  ('time_management','Time Management',      'Gestión del tiempo',      'soft',     '{}'),
  ('adaptability',  'Adaptability',          'Adaptabilidad',           'soft',     '{}')
on conflict (slug) do nothing;
