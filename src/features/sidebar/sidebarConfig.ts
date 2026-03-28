import type { LucideIcon } from 'lucide-react';

export type SubMenuItem = {
  label: string;
  path: string;
  actions?: string[];
};

export type MenuItem = {
  label: string;
  icon: LucideIcon;
  path?: string;
  actions?: string[];
  children?: SubMenuItem[];
};
