import {
  LayoutDashboard,
  Globe,
  Users,
  CalendarCheck,
  KeyRound,
  Mails,
  HandCoins,
  ScrollText,
  Tags,
  Layers,
  Circle,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Globe,
  Users,
  CalendarCheck,
  KeyRound,
  Mails,
  HandCoins,
  ScrollText,
  Tags,
  Layers,
};

export const getIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return Circle;
  return iconMap[iconName] || Circle;
};
