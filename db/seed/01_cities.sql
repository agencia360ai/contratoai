-- =============================================================================
-- Seed: Panamá cities + provinces
-- =============================================================================

insert into cities (name, province, lat, lng, population, slug) values
  ('Ciudad de Panamá',  'Panamá',           8.9824,  -79.5199, 880691, 'panama-ciudad'),
  ('San Miguelito',      'Panamá',           9.0331,  -79.5005, 315019, 'san-miguelito'),
  ('Tocumen',            'Panamá',           9.0814,  -79.3837,  74952, 'tocumen'),
  ('Las Cumbres',        'Panamá',           9.1019,  -79.5408,  31352, 'las-cumbres'),
  ('Pacora',             'Panamá',           9.0967,  -79.2783,  53977, 'pacora'),
  ('Arraiján',           'Panamá Oeste',     8.9521,  -79.6661, 271572, 'arraijan'),
  ('La Chorrera',        'Panamá Oeste',     8.8790,  -79.7833, 168521, 'la-chorrera'),
  ('Capira',             'Panamá Oeste',     8.7617,  -79.8825,  41207, 'capira'),
  ('Chame',              'Panamá Oeste',     8.6939,  -79.9608,  23735, 'chame'),
  ('San Carlos',         'Panamá Oeste',     8.4900,  -80.0828,  17456, 'san-carlos-pa'),
  ('Colón',              'Colón',            9.3573,  -79.9006, 158578, 'colon'),
  ('Sabanitas',          'Colón',            9.3489,  -79.7972,  33000, 'sabanitas'),
  ('David',              'Chiriquí',         8.4274,  -82.4309, 144858, 'david'),
  ('Boquete',            'Chiriquí',         8.7800,  -82.4360,  20988, 'boquete'),
  ('Bugaba',             'Chiriquí',         8.4830,  -82.6160,  39000, 'bugaba'),
  ('Puerto Armuelles',   'Chiriquí',         8.2783,  -82.8714,  21401, 'puerto-armuelles'),
  ('Volcán',             'Chiriquí',         8.7700,  -82.6300,  10000, 'volcan'),
  ('Santiago',           'Veraguas',         8.1014,  -80.9803, 122900, 'santiago'),
  ('Soná',               'Veraguas',         8.0119,  -81.3225,  21500, 'sona'),
  ('Atalaya',            'Veraguas',         8.0436,  -81.0431,  10500, 'atalaya'),
  ('Penonomé',           'Coclé',            8.5181,  -80.3580,  88260, 'penonome'),
  ('Aguadulce',          'Coclé',            8.2422,  -80.5519,  43153, 'aguadulce'),
  ('Antón',              'Coclé',            8.3989,  -80.2617,  47900, 'anton'),
  ('La Pintada',         'Coclé',            8.5897,  -80.4628,  25400, 'la-pintada'),
  ('Chitré',             'Herrera',          7.9667,  -80.4333,  47000, 'chitre'),
  ('Las Tablas',         'Los Santos',       7.7639,  -80.2761,  25000, 'las-tablas'),
  ('Guararé',            'Los Santos',       7.8167,  -80.2833,  10500, 'guarare'),
  ('Bocas del Toro',     'Bocas del Toro',   9.3403,  -82.2406,  15500, 'bocas-del-toro'),
  ('Changuinola',        'Bocas del Toro',   9.4314,  -82.5172,  60800, 'changuinola'),
  ('Almirante',          'Bocas del Toro',   9.3000,  -82.4000,  13580, 'almirante'),
  ('Metetí',             'Darién',           8.4831,  -77.9700,  10500, 'meteti'),
  ('La Palma',           'Darién',           8.4067,  -78.1500,  4500,  'la-palma'),
  ('El Porvenir',        'Guna Yala',        9.5575,  -78.9550,  300,   'el-porvenir')
on conflict (slug) do nothing;
