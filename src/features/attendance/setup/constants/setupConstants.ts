export enum TabType {
  SHIFTS = 'shifts',
  WEEKLY_OFFS = 'weeklyOffs',
  RULES = 'rules',
  ASSIGN = 'assign',
}

export const tabs: { id: TabType; label: string; number: number }[] = [
  { id: TabType.SHIFTS, label: 'Shifts', number: 1 },
  { id: TabType.WEEKLY_OFFS, label: 'Weekly Offs', number: 2 },
  { id: TabType.RULES, label: 'Rules', number: 3 },
  { id: TabType.ASSIGN, label: 'Assign', number: 4 },
];

export const getTitleAndSubtitle = (tab: TabType) => {
  switch (tab) {
    case TabType.SHIFTS:
      return { title: 'Shifts', subtitle: 'Define working hours for your team.' };
    case TabType.WEEKLY_OFFS:
      return { title: 'Weekly Offs', subtitle: 'Define holiday patterns.' };
    case TabType.RULES:
      return { title: 'Attendance Rules', subtitle: 'Define attendance logic.' };
    case TabType.ASSIGN:
      return {
        title: 'Assign Rules',
        subtitle: 'Map attendance rules to departments or employees.',
      };
    default:
      return { title: 'Attendance Setup', subtitle: 'Configure attendance.' };
  }
};
