// Domain types matching the SQL schema. Hand-rolled (no Supabase typegen yet).

export type Bracket =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "legend";

export type Modality = "onsite" | "remote" | "hybrid";

export type ExperienceLevel = "intern" | "junior" | "mid" | "senior" | "lead" | "exec";

export interface Job {
  id: string;
  source: string;
  url: string;
  title: string;
  company_id: string | null;
  company_name?: string;
  company_bracket?: Bracket | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  description: string | null;
  skills_extracted: string[];
  benefits_extracted: string[];
  languages_required: { lang: string; level: string }[];
  experience_level: ExperienceLevel | null;
  modality: Modality | null;
  industry: string | null;
  posted_at: string | null;
  scraped_at: string;
  is_active: boolean;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  location: string | null;
  logo_url: string | null;
  description: string | null;
  score: number;
  bracket: Bracket | null;
  rank_in_country: number | null;
  rank_in_industry: number | null;
}

export interface Match {
  id: string;
  candidate_id: string;
  job_id: string;
  score: number;
  scores: {
    skill: number;
    experience: number;
    culture: number;
    location: number;
    salary: number;
    ai_final?: number;
  };
  explanation: string | null;
  red_flags: string[];
  reranked_by_ai: boolean;
  is_seen: boolean;
  is_liked: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  skills: { name: string; level?: number }[];
  preferences: {
    salary_min?: number;
    modality?: Modality;
    industries_interest?: string[];
  };
  onboarding_complete: boolean;
  profile_completion: number;
  last_active_at: string;
}

export interface UserProgress {
  user_id: string;
  user_type: "candidate" | "recruiter" | "company";
  total_xp: number;
  level: number;
  bracket: Bracket;
  current_streak: number;
  longest_streak: number;
  applications_sent: number;
  matches_received: number;
  matches_liked: number;
  interviews: number;
  offers: number;
  rank_global: number | null;
}

export interface Achievement {
  id: number;
  slug: string;
  name_es: string;
  description: string;
  icon: string;
  tier: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  user_type: "candidate" | "recruiter" | "company" | "any";
}

export interface UserAchievement extends Achievement {
  unlocked_at: string;
}

export interface CompanyLeaderboardRow {
  company_id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  total_score: number;
  bracket: Bracket;
  rank_global: number;
  rank_in_industry: number | null;
  score_change_week: number;
  avg_response_time_h: number | null;
  active_jobs_count: number;
  total_hires: number;
}

export interface RecruiterLeaderboardRow {
  recruiter_id: string;
  display_name: string;
  avatar_url: string | null;
  title: string | null;
  score: number;
  bracket: Bracket;
  rank: number;
  company_name: string | null;
  company_logo: string | null;
  industry: string | null;
  avg_response_time_h: number | null;
  hires_completed: number;
  is_verified: boolean;
}
