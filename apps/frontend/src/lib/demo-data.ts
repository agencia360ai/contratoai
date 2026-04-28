import type { Job } from "@/lib/types";

// Demo data for previewing the UI without a configured Supabase backend.
// All data is fictional. Replace by real queries when Supabase is configured.

type DemoJob = Pick<
  Job,
  | "id"
  | "title"
  | "location"
  | "salary_min"
  | "salary_max"
  | "salary_currency"
  | "modality"
  | "experience_level"
  | "posted_at"
  | "skills_extracted"
  | "benefits_extracted"
  | "description"
  | "url"
  | "source"
  | "is_active"
> & {
  company_name: string;
  company_bracket: NonNullable<Job["company_bracket"]>;
};

export const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "Desarrollador Frontend Senior",
    company_name: "Banco General",
    company_bracket: "gold",
    location: "Ciudad de Panamá",
    salary_min: 2800,
    salary_max: 3500,
    salary_currency: "USD",
    modality: "hybrid",
    experience_level: "senior",
    posted_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    skills_extracted: ["react", "typescript", "next.js", "css", "git"],
    benefits_extracted: ["seguro_medico", "homeoffice_parcial", "capacitacion"],
    description:
      "Buscamos desarrollador con +5 años de experiencia en React. Trabajarás en el equipo de banca digital construyendo nuestra app móvil.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
  {
    id: "demo-2",
    title: "Analista de Crédito Junior",
    company_name: "Banistmo",
    company_bracket: "gold",
    location: "Ciudad de Panamá",
    salary_min: 1100,
    salary_max: 1400,
    salary_currency: "USD",
    modality: "onsite",
    experience_level: "junior",
    posted_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    skills_extracted: ["excel", "credit_analysis", "contabilidad", "lang_en_b1"],
    benefits_extracted: ["seguro_medico", "bono_anual", "capacitacion"],
    description:
      "Posición ideal para egresados de finanzas. Te entrenamos en análisis crediticio.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
  {
    id: "demo-3",
    title: "Customer Service Bilingüe (EN/ES)",
    company_name: "Konecta",
    company_bracket: "diamond",
    location: "Tocumen",
    salary_min: 850,
    salary_max: 1100,
    salary_currency: "USD",
    modality: "onsite",
    experience_level: "junior",
    posted_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    skills_extracted: ["lang_en_b2", "customer_service", "communication"],
    benefits_extracted: ["transporte", "alimentacion", "bono_desempeno"],
    description: "BPO multinacional. Atención telefónica a clientes en EE.UU.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
  {
    id: "demo-4",
    title: "Coordinador de Logística",
    company_name: "Copa Airlines",
    company_bracket: "platinum",
    location: "Tocumen",
    salary_min: 1800,
    salary_max: 2400,
    salary_currency: "USD",
    modality: "onsite",
    experience_level: "mid",
    posted_at: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
    skills_extracted: ["logistics", "excel", "lang_en_b2", "warehouse"],
    benefits_extracted: ["seguro_medico", "viajes", "descuento_empresa"],
    description: "Coordina operaciones de carga internacional desde Hub Tocumen.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
  {
    id: "demo-5",
    title: "Asistente Administrativa",
    company_name: "Multimodal Panamá",
    company_bracket: "bronze",
    location: "Colón",
    salary_min: 750,
    salary_max: 950,
    salary_currency: "USD",
    modality: "onsite",
    experience_level: "junior",
    posted_at: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    skills_extracted: ["excel", "word", "outlook", "customer_service"],
    benefits_extracted: ["alimentacion", "transporte"],
    description:
      "Apoyo a gerencia general en empresa logística de la Zona Libre de Colón.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
  {
    id: "demo-6",
    title: "Ingeniero DevOps Remoto",
    company_name: "Tigo Panamá",
    company_bracket: "platinum",
    location: "Remoto",
    salary_min: 3200,
    salary_max: 4500,
    salary_currency: "USD",
    modality: "remote",
    experience_level: "senior",
    posted_at: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    skills_extracted: ["aws", "kubernetes", "docker", "python", "git"],
    benefits_extracted: ["homeoffice_total", "horario_flexible", "laptop"],
    description: "Trabajo 100% remoto. Equipo distribuido en LATAM.",
    url: "https://example.com",
    source: "demo",
    is_active: true,
  },
] satisfies DemoJob[];

export const DEMO_COMPANIES = [
  { company_id: "c1", name: "Banistmo",        industry: "Banca",      size: "500+",   location: "Ciudad de Panamá", total_score: 47892, rank_global: 1, rank_in_industry: 1, score_change_week:  3, avg_response_time_h: 1.2, active_jobs_count: 23, total_hires: 412 },
  { company_id: "c2", name: "Banco General",   industry: "Banca",      size: "500+",   location: "Ciudad de Panamá", total_score: 42156, rank_global: 2, rank_in_industry: 2, score_change_week:  1, avg_response_time_h: 1.8, active_jobs_count: 18, total_hires: 378 },
  { company_id: "c3", name: "Copa Airlines",   industry: "Aviación",   size: "500+",   location: "Tocumen",          total_score: 38901, rank_global: 3, rank_in_industry: 1, score_change_week: -1, avg_response_time_h: 2.4, active_jobs_count: 15, total_hires: 287 },
  { company_id: "c4", name: "BAC Credomatic",  industry: "Banca",      size: "500+",   location: "Ciudad de Panamá", total_score: 31204, rank_global: 4, rank_in_industry: 3, score_change_week:  2, avg_response_time_h: 3.1, active_jobs_count: 12, total_hires: 245 },
  { company_id: "c5", name: "Tigo Panamá",     industry: "Telecom",    size: "500+",   location: "Ciudad de Panamá", total_score: 28475, rank_global: 5, rank_in_industry: 1, score_change_week:  0, avg_response_time_h: 4.2, active_jobs_count: 9,  total_hires: 198 },
  { company_id: "c6", name: "Global Bank",     industry: "Banca",      size: "201-500",location: "Ciudad de Panamá", total_score: 18950, rank_global: 6, rank_in_industry: 4, score_change_week:  4, avg_response_time_h: 5.0, active_jobs_count: 7,  total_hires: 156 },
  { company_id: "c7", name: "Konecta",         industry: "BPO",        size: "500+",   location: "Tocumen",          total_score: 15240, rank_global: 7, rank_in_industry: 1, score_change_week:  2, avg_response_time_h: 2.8, active_jobs_count: 24, total_hires: 612 },
  { company_id: "c8", name: "Caterpillar",     industry: "Maquinaria", size: "201-500",location: "Ciudad de Panamá", total_score: 12100, rank_global: 8, rank_in_industry: 1, score_change_week: -2, avg_response_time_h: 6.0, active_jobs_count: 5,  total_hires: 98  },
  { company_id: "c9", name: "Cervecería Nacional",industry: "Alimentos",size: "201-500",location: "Ciudad de Panamá", total_score: 9450, rank_global: 9, rank_in_industry: 1, score_change_week:  1, avg_response_time_h: 8.0, active_jobs_count: 4,  total_hires: 87  },
  { company_id: "c10", name: "Multimodal Panamá",industry: "Logística", size: "51-200", location: "Colón",            total_score: 7820,    rank_global: 10, rank_in_industry: 1, score_change_week:  3, avg_response_time_h: 12,  active_jobs_count: 3,  total_hires: 54  },
  { company_id: "c11", name: "Banco Aliado",     industry: "Banca",      size: "201-500",location: "Ciudad de Panamá", total_score: 6450,    rank_global: 11, rank_in_industry: 5, score_change_week:  0, avg_response_time_h: 14,  active_jobs_count: 6,  total_hires: 48  },
  { company_id: "c12", name: "Telecarrier",      industry: "Telecom",    size: "51-200", location: "Ciudad de Panamá", total_score: 5210,    rank_global: 12, rank_in_industry: 2, score_change_week: -1, avg_response_time_h: 16,  active_jobs_count: 2,  total_hires: 32  },
  { company_id: "c13", name: "PriceSmart",       industry: "Retail",     size: "500+",   location: "Costa del Este",   total_score: 4890,    rank_global: 13, rank_in_industry: 1, score_change_week:  1, avg_response_time_h: 18,  active_jobs_count: 8,  total_hires: 92  },
  { company_id: "c14", name: "Casa Esmeralda",   industry: "Construcción",size: "51-200",location: "Ciudad de Panamá", total_score: 3420,    rank_global: 14, rank_in_industry: 1, score_change_week:  2, avg_response_time_h: 24,  active_jobs_count: 4,  total_hires: 23  },
  { company_id: "c15", name: "Súper 99",         industry: "Retail",     size: "500+",   location: "Ciudad de Panamá", total_score: 2840,  rank_global: 15, rank_in_industry: 2, score_change_week: -3, avg_response_time_h: 36,  active_jobs_count: 14, total_hires: 145 },
];

export const DEMO_RECRUITERS = [
  { recruiter_id: "r1", display_name: "María González",   avatar_url: null, title: "TA Manager",       score: 12480, rank: 1, company_name: "Banistmo",      company_logo: null, industry: "Banca",   avg_response_time_h: 0.8, hires_completed: 47, is_verified: true },
  { recruiter_id: "r2", display_name: "Carlos Rodríguez", avatar_url: null, title: "Sr. Recruiter",    score:  9870, rank: 2, company_name: "Banco General", company_logo: null, industry: "Banca",   avg_response_time_h: 1.5, hires_completed: 38, is_verified: true },
  { recruiter_id: "r3", display_name: "Ana Castillo",     avatar_url: null, title: "TA Lead",          score:  7240,     rank: 3, company_name: "Copa Airlines", company_logo: null, industry: "Aviación",avg_response_time_h: 2.1, hires_completed: 29, is_verified: true },
  { recruiter_id: "r4", display_name: "Luis Pérez",       avatar_url: null, title: "Recruiter",        score:  5680,     rank: 4, company_name: "Tigo Panamá",   company_logo: null, industry: "Telecom", avg_response_time_h: 3.4, hires_completed: 22, is_verified: false },
  { recruiter_id: "r5", display_name: "Sofía Vargas",     avatar_url: null, title: "Talent Acquisition", score: 4120,    rank: 5, company_name: "BAC Credomatic",company_logo: null, industry: "Banca",   avg_response_time_h: 4.0, hires_completed: 18, is_verified: false },
];

export const DEMO_PROGRESS = {
  user_id: "demo-user",
  user_type: "candidate" as const,
  total_xp: 2450,
  level: 4,
  current_streak: 5,
  longest_streak: 12,
  applications_sent: 14,
  matches_received: 23,
  matches_liked: 8,
  interviews: 3,
  offers: 1,
  rank_global: 47,
};

export const DEMO_ACHIEVEMENTS = [
  { id: 1, slug: "first_step",    name_es: "Primer paso",        description: "Completaste tu perfil básico.",     icon: "Sprout",  tier: "common" as const,    xp_reward: 50,  unlocked_at: new Date(Date.now() - 86400 * 1000 * 7).toISOString() },
  { id: 2, slug: "first_apply",   name_es: "Aplicación 1",       description: "Aplicaste a tu primer trabajo.",    icon: "Send",    tier: "common" as const,    xp_reward: 25,  unlocked_at: new Date(Date.now() - 86400 * 1000 * 6).toISOString() },
  { id: 3, slug: "applicator",    name_es: "Aplicador serial",   description: "10 aplicaciones enviadas.",          icon: "Briefcase",tier: "rare" as const,    xp_reward: 100, unlocked_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 4, slug: "polyglot",      name_es: "Políglota",          description: "Declaraste 2+ idiomas validados.",  icon: "Globe",   tier: "rare" as const,      xp_reward: 100, unlocked_at: new Date(Date.now() - 86400 * 1000 * 5).toISOString() },
  { id: 5, slug: "streak_7",      name_es: "Una semana firme",   description: "Login 7 días consecutivos.",         icon: "Flame",   tier: "rare" as const,      xp_reward: 75,  unlocked_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString() },
  { id: 6, slug: "match_master",  name_es: "Match Master",       description: "5 matches con score >0.9.",          icon: "Sparkles",tier: "epic" as const,      xp_reward: 250 },
  { id: 7, slug: "fast_learner",  name_es: "Aprendiz rápido",    description: "Pasaste 5 mini-tests de habilidad.", icon: "Zap",     tier: "rare" as const,      xp_reward: 150 },
  { id: 8, slug: "first_interview",name_es:"Primera entrevista", description: "Llegaste a una entrevista.",         icon: "MessageCircle",tier: "rare" as const, xp_reward: 150, unlocked_at: new Date(Date.now() - 86400 * 1000 * 3).toISOString() },
];

export const DEMO_MATCHES = DEMO_JOBS.slice(0, 4).map((j, i) => ({
  id: `m-${j.id}`,
  candidate_id: "demo-user",
  job_id: j.id,
  score: [0.94, 0.87, 0.78, 0.66][i],
  scores: { skill: 0.9, experience: 0.85, culture: 0.92, location: 1, salary: 0.8, ai_final: [0.94, 0.87, 0.78, 0.66][i] },
  explanation: [
    "Tu experiencia en React + tu perfil de C-alto encajan con la cultura disciplinada de Banco General.",
    "Buen match para crecer: nivel junior + tus skills financieros + skills financieros para Banistmo.",
    "Inglés B2 + customer service = 4/5 skills perfectos. Solo te falta validar atención telefónica.",
    "Logística + inglés + ubicación cercana al hub Tocumen. Salario un poco bajo de tu rango.",
  ][i],
  red_flags: i === 3 ? ["Salario bajo de tu mínimo declarado"] : [],
  reranked_by_ai: true,
  is_seen: false,
  is_liked: false,
  created_at: new Date().toISOString(),
  job: { ...j, company: { name: j.company_name, bracket: j.company_bracket } },
}));
