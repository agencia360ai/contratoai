-- =============================================================================
-- Seed: Achievement catalog
-- =============================================================================

-- ----- Candidate achievements ----------------------------------------------
insert into achievements (slug, name_es, name_en, description, icon, tier, xp_reward, user_type, trigger_rule) values
  ('first_step',    'Primer paso',         'First Step',     'Completaste tu perfil básico.',                              'Sprout',     'common',    50, 'candidate', '{"type":"profile_completion","value":50}'),
  ('full_profile',  'Profesional completo','Full Profile',   'Tu perfil está al 100%. Ahora la IA te encuentra mejor.',     'CheckCheck', 'rare',     150, 'candidate', '{"type":"profile_completion","value":100}'),
  ('polyglot',      'Políglota',           'Polyglot',       'Declaraste 2+ idiomas con nivel validado.',                   'Globe',      'rare',     100, 'candidate', '{"type":"languages_validated","value":2}'),
  ('fast_learner',  'Aprendiz rápido',     'Fast Learner',   'Pasaste 5 mini-tests de habilidad.',                          'Zap',        'rare',     150, 'candidate', '{"type":"skills_validated","value":5}'),
  ('first_apply',   'Aplicación 1',        'First Application','Aplicaste a tu primer trabajo.',                           'Send',       'common',    25, 'candidate', '{"type":"applications_sent","value":1}'),
  ('applicator',    'Aplicador serial',    'Applicator',     '10 aplicaciones enviadas.',                                   'Briefcase',  'rare',     100, 'candidate', '{"type":"applications_sent","value":10}'),
  ('applicator_pro','Aplicador pro',       'Pro Applicator', '50 aplicaciones enviadas.',                                   'Trophy',     'epic',     400, 'candidate', '{"type":"applications_sent","value":50}'),
  ('match_master',  'Match Master',        'Match Master',   '5 matches con score >0.9.',                                   'Sparkles',   'epic',     250, 'candidate', '{"type":"high_matches","value":5}'),
  ('first_interview','Primera entrevista', 'First Interview','Llegaste a una entrevista.',                                  'MessageCircle','rare',  150, 'candidate', '{"type":"interviews","value":1}'),
  ('hired',         'Contratado',          'Hired!',         'Conseguiste oferta. ¡Felicidades!',                           'PartyPopper','legendary', 500, 'candidate', '{"type":"hires","value":1}'),
  ('streak_7',      'Una semana firme',    '7-day Streak',   'Login 7 días consecutivos.',                                  'Flame',      'rare',      75, 'candidate', '{"type":"streak","value":7}'),
  ('streak_30',     'Un mes en racha',     '30-day Streak',  '30 días consecutivos. Eres bien constante.',                  'Flame',      'epic',     300, 'candidate', '{"type":"streak","value":30}'),
  ('streak_100',    'Leyenda de la racha','100-day Streak', '100 días sin parar. Inhumano.',                                'Crown',      'legendary',1000, 'candidate', '{"type":"streak","value":100}'),

-- ----- Recruiter achievements ----------------------------------------------
  ('first_hire',    'Primera contratación','First Hire',    'Cerraste tu primera contratación en TeContrato.',            'CheckCircle2','rare',   200, 'recruiter','{"type":"hires_completed","value":1}'),
  ('quick_responder','Respondedor veloz', 'Quick Responder','Respondes en menos de 4 horas en promedio.',                 'Zap',         'rare',    150, 'recruiter','{"type":"avg_response_h","max":4}'),
  ('feedback_giver','Reclutador empático','Feedback Giver', 'Diste feedback a 20 candidatos rechazados.',                  'Heart',       'epic',    300, 'recruiter','{"type":"feedback_count","value":20}'),
  ('transparent',   'Transparente',        'Transparent',   'Publicaste 10 vacantes con rango salarial.',                  'Eye',         'rare',    150, 'recruiter','{"type":"transparent_jobs","value":10}'),
  ('ten_hires',     '10 contrataciones',   '10 Hires',      'Cerraste 10 contrataciones.',                                 'Trophy',      'epic',    500, 'recruiter','{"type":"hires_completed","value":10}'),
  ('top_recruiter', 'Top reclutador',      'Top Recruiter', 'Llegaste al top 10 nacional.',                                'Crown',       'legendary',1500,'recruiter','{"type":"rank","max":10}'),

-- ----- Company achievements ------------------------------------------------
  ('first_post',    'Primera vacante',     'First Post',    'Tu empresa publicó su primera vacante.',                      'Briefcase',   'common',   50, 'company',  '{"type":"jobs_posted","value":1}'),
  ('top_50_company','Top 50 país',         'Top 50',        'Tu empresa llegó al top 50 nacional.',                        'Trophy',      'epic',    500, 'company',  '{"type":"rank","max":50}'),
  ('top_10_company','Top 10 país',         'Top 10',        'Tu empresa llegó al top 10 nacional.',                        'Crown',       'legendary',2000,'company',  '{"type":"rank","max":10}')
on conflict (slug) do nothing;

-- ----- Quests (daily/weekly missions) --------------------------------------
insert into quests (slug, title_es, description, icon, user_type, cadence, goal_type, goal_value, xp_reward) values
  ('daily_apply',       'Aplica a un trabajo hoy',          '+20 XP por enviar una aplicación.',                'Send',        'candidate', 'daily',    'applications_sent', 1, 20),
  ('daily_swipe',       'Revisa 5 matches',                 'Mira al menos 5 matches sugeridos.',               'Eye',         'candidate', 'daily',    'matches_viewed',     5, 15),
  ('weekly_skill',      'Valida 1 habilidad esta semana',   'Pasa un mini-test de skill que declaraste.',       'Zap',         'candidate', 'weekly',   'skills_validated',   1, 50),
  ('rec_daily_respond', 'Responde a 5 candidatos hoy',      'Mejora tu tiempo de respuesta. +50 XP.',           'MessageCircle','recruiter','daily',    'responses',          5, 50),
  ('rec_daily_feedback','Da feedback a 3 rechazados',       'Los candidatos lo agradecen y tu empresa sube.',   'Heart',        'recruiter','daily',    'feedback_given',     3, 60),
  ('rec_weekly_post',   'Publica 2 vacantes con salario',   'Transparencia salarial = +bracket.',                'Eye',          'recruiter','weekly',   'transparent_jobs',   2, 100)
on conflict (slug) do nothing;
