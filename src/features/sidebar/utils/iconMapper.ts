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
  Megaphone,
  Fingerprint,
  Clock,
  ReceiptText,
  Receipt,
  CalendarOff,
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
  Megaphone,
  Fingerprint,
  Clock,
  ReceiptText,
  Receipt,
  CalendarOff,
};

export const getIconComponent = (iconName: string | null): LucideIcon => {
  if (!iconName) return Circle;
  return iconMap[iconName] || Circle;
};
