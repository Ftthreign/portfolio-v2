export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  avatar_url?: string;
  resume_url?: string;
  email?: string;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  cover_image_url: string;
  tech_stack: string[];
  category?: string;
  client?: string;
  role?: string;
  year?: string;
  repo_url: string;
  live_url: string;
  featured: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  reading_time_minutes: number;
}

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    return import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
  }
  return import.meta.env.INTERNAL_API_URL || import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
};

const DEFAULT_PROFILE: Profile = {
  name: 'Fadhil Abdul Fattah',
  tagline: 'Product Designer & Fullstack Engineer',
  bio: 'Passionate about creating intuitive digital experiences that connect users with value.',
  email: 'fadhil@example.com',
  location: 'Indonesia / Remote',
  avatar_url: '/FADHIL ABDUL FATTAH BW.webp',
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Aether Design System',
    slug: 'aether-design-system',
    short_description: 'A multi-platform enterprise design system powering 20+ web and mobile applications with 120+ fluid components.',
    full_description: 'Aether is an end-to-end design system created for cloud platforms. Built with accessibility, dark/light dynamic tokens, component specs, and motion guidelines.',
    cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    tech_stack: ['Design System', 'Figma Tokens', 'React', 'TailwindCSS', 'Storybook'],
    category: 'Design System',
    client: 'Aether Cloud Platform',
    role: 'Lead Systems Designer',
    year: '2025',
    repo_url: 'https://github.com/elianross/aether-ds',
    live_url: 'https://aether-ds.elianross.design',
    featured: true,
  },
  {
    id: '2',
    title: 'Apex Fintech Intelligence',
    slug: 'apex-fintech-analytics',
    short_description: 'Next-gen real-time financial intelligence dashboard for enterprise traders and wealth managers.',
    full_description: 'Comprehensive UI/UX overhaul of complex financial visualization dashboards, reducing cognitive load and accelerating execution speed by 40%.',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    tech_stack: ['Product Design', 'TypeScript', 'D3.js', 'TailwindCSS', 'GSAP'],
    category: 'Product Design',
    client: 'Apex Financial',
    role: 'Principal Product Designer',
    year: '2024',
    repo_url: 'https://github.com/elianross/apex-analytics',
    live_url: 'https://apex.elianross.design',
    featured: true,
  },
  {
    id: '3',
    title: 'Lumina AI Workspace',
    slug: 'lumina-ai-workspace',
    short_description: 'Generative AI workspace interface optimizing prompt iteration, canvas collaboration, and asset management.',
    full_description: 'Designed human-in-the-loop AI interactions and canvas workflows for over 150,000 creative professionals.',
    cover_image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
    tech_stack: ['UX Research', 'Figma', 'Next.js', 'WebSockets', 'GSAP'],
    category: 'Web Application',
    client: 'Lumina Creative Labs',
    role: 'UX & Motion Architect',
    year: '2024',
    repo_url: 'https://github.com/elianross/lumina-ai',
    live_url: 'https://lumina.elianross.design',
    featured: true,
  },
];

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Designing for Scale: Building Systems That Evolve With Teams',
    slug: 'designing-for-scale-in-2025',
    excerpt: 'How we created a resilient token structure and component hierarchy that scaled across 15 engineering squads without fragmentation.',
    content: '<p>Design systems are culture first, technology second. When scaling across dozens of engineers, key architectural decisions determine whether components stay consistent or fracture.</p><h3>1. Token Foundation</h3><p>Establish semantic color and spatial tokens instead of hardcoded hex values...</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    tags: ['Design System', 'Architecture', 'UX'],
    published: true,
    reading_time_minutes: 6,
  },
  {
    id: '2',
    title: 'The Art of Micro-Interactions: Enhancing Perception & Delight',
    slug: 'the-art-of-micro-interactions',
    excerpt: 'Exploring how subtle motion, feedback loops, and spring physics elevate user interfaces from functional to memorable.',
    content: '<p>Great interface animation is invisible—it guides attention, builds spatial intuition, and creates emotional resonance without delaying user actions.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    tags: ['Motion', 'GSAP', 'UI Design'],
    published: true,
    reading_time_minutes: 4,
  },
];

export async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data || DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/projects/${slug}`);
    if (!res.ok) return DEFAULT_PROJECTS.find(p => p.slug === slug) || null;
    const data = await res.json();
    return data || DEFAULT_PROJECTS.find(p => p.slug === slug) || null;
  } catch {
    return DEFAULT_PROJECTS.find(p => p.slug === slug) || null;
  }
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/blog`);
    if (!res.ok) throw new Error('Failed to fetch blog posts');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_POSTS;
  } catch {
    return DEFAULT_POSTS;
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/blog/${slug}`);
    if (!res.ok) return DEFAULT_POSTS.find(b => b.slug === slug) || null;
    const data = await res.json();
    return data || DEFAULT_POSTS.find(b => b.slug === slug) || null;
  } catch {
    return DEFAULT_POSTS.find(b => b.slug === slug) || null;
  }
}

export const DEFAULT_TECH_STACK = [
  'Go (Golang)',
  'TypeScript',
  'Astro TS',
  'React.js',
  'GSAP Motion',
  'Tailwind CSS',
  'PostgreSQL',
  'Docker',
  'Cloudflare R2',
  'Redis',
  'GraphQL',
  'Next.js',
];

export async function fetchTechStack(): Promise<string[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/tech-stack`);
    if (!res.ok) return DEFAULT_TECH_STACK;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_TECH_STACK;
  } catch {
    return DEFAULT_TECH_STACK;
  }
}

