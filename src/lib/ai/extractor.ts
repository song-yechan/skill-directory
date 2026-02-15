import Anthropic from '@anthropic-ai/sdk';

interface ExtractedSkill {
  readonly name: string;
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly install_guide: string;
  readonly usage_guide: string;
  readonly examples: string;
  readonly category: string;
  readonly tags: readonly string[];
}

const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'];

export async function extractSkillInfo(
  readme: string,
  apiKey: string
): Promise<ExtractedSkill> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyze this Claude Code skill README and extract structured information.

README:
${readme.slice(0, 8000)}

Return a JSON object with these fields:
- name: skill name (short, human-readable)
- description_en: 1-2 sentence description in English
- description_ko: same description in Korean
- summary_en: one-line summary in English (max 100 chars)
- summary_ko: same summary in Korean
- install_guide: installation steps (markdown, keep original code blocks)
- usage_guide: how to use the skill (markdown)
- examples: example usage or output (markdown)
- category: one of ${JSON.stringify(CATEGORIES)}
- tags: 3-5 relevant tags (lowercase, kebab-case)

Return ONLY valid JSON, no markdown fences.`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}
