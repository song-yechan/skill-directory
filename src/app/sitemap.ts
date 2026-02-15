import { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';

const BASE_URL = 'https://skill-directory-livid.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const { data: skills } = await supabase
    .from('skills')
    .select('slug, updated_at')
    .order('popularity_score', { ascending: false });

  const skillUrls: MetadataRoute.Sitemap = [];

  if (skills) {
    for (const skill of skills) {
      skillUrls.push({
        url: `${BASE_URL}/ko/skills/${skill.slug}`,
        lastModified: new Date(skill.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      skillUrls.push({
        url: `${BASE_URL}/en/skills/${skill.slug}`,
        lastModified: new Date(skill.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/ko`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ko/skills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/skills`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ko/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/ko/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...skillUrls];
}
