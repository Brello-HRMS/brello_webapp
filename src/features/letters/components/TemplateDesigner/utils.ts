import { DEFAULT_SETTINGS } from '../../types/designerTypes';

import type { TemplateDesign, TemplateBlock, BlockSize } from '../../types/designerTypes';
import type { LetterTemplate } from '../../types/letterTypes';

export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(2, -2).trim()))];
}

export function migrateToDesign(template: LetterTemplate): TemplateDesign {
  const blocks: TemplateBlock[] = [];
  if (template.subject?.trim())
    blocks.push({ id: crypto.randomUUID(), type: 'subject', content: template.subject });
  if (template.content?.trim())
    blocks.push({ id: crypto.randomUUID(), type: 'text', content: template.content });
  return { version: 1, settings: DEFAULT_SETTINGS, blocks, customVariables: [] };
}

export const HEADING_SIZES: Record<BlockSize, string> = {
  sm: '1rem',
  md: '1.1875rem',
  lg: '1.3125rem',
};

export const TEXT_SIZES: Record<BlockSize, string> = {
  sm: '0.8125rem',
  md: '0.875rem',
  lg: '1rem',
};
