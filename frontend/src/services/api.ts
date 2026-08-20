export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  avatar_url?: string;
  resume_url?: string;
  email?: string;
  location?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  icon_url: string;
  proficiency: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  cover_image_url: string;
  tech_stack: string[];
  repo_url: string;
  live_url: string;
  featured: boolean;
}

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    return import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
  }
  return import.meta.env.INTERNAL_API_URL || import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
};

export async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch {
    return {
      name: 'Fadhil',
      tagline: 'Fullstack Engineer & Systems Builder',
      bio: 'Crafting thoughtful digital experiences with Go, TypeScript, Astro, and PostgreSQL.',
      location: 'Indonesia',
    };
  }
}

export async function fetchSkills(): Promise<SkillCategory[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/skills`);
    if (!res.ok) throw new Error('Failed to fetch skills');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch {
    return [];
  }
}
