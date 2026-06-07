export enum DashboardWidget {
  HERO_STATS = 'HERO_STATS',
  APPROVAL_REQUESTS = 'APPROVAL_REQUESTS',
  BIRTHDAYS = 'BIRTHDAYS',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  DAILY_ATTENDANCE_REPORT = 'DAILY_ATTENDANCE_REPORT',
  EMPLOYEE_DAILY_ATTENDANCE = 'EMPLOYEE_DAILY_ATTENDANCE',
  HOLIDAYS = 'HOLIDAYS',
  NEW_HIRES = 'NEW_HIRES',
  SETUP_GUIDE = 'SETUP_GUIDE',
}

export const AppWidgetMapping: Record<string, DashboardWidget[]> = {
  ADMIN: [
    DashboardWidget.HERO_STATS,
    DashboardWidget.APPROVAL_REQUESTS,
    DashboardWidget.BIRTHDAYS,
    DashboardWidget.ANNOUNCEMENTS,
    DashboardWidget.DAILY_ATTENDANCE_REPORT,
    DashboardWidget.HOLIDAYS,
    DashboardWidget.NEW_HIRES,
    DashboardWidget.SETUP_GUIDE,
  ],
  EMPLOYEE: [
    DashboardWidget.BIRTHDAYS,
    DashboardWidget.ANNOUNCEMENTS,
    DashboardWidget.EMPLOYEE_DAILY_ATTENDANCE,
    DashboardWidget.HOLIDAYS,
    DashboardWidget.NEW_HIRES,
  ],
};

import { getCurrentAppId, getAvailableApps } from '../../../utils/authUtils';

export const useDashboardWidgets = () => {
  const currentAppId = getCurrentAppId();
  const availableApps = getAvailableApps();
  const currentApp = availableApps.find((app) => app.id === currentAppId);

  // Default to EMPLOYEE if app is not found to be safe
  const appName = currentApp?.name.toUpperCase() || 'EMPLOYEE';

  const activeWidgets = AppWidgetMapping[appName] || AppWidgetMapping['EMPLOYEE'];

  const canView = (widget: DashboardWidget) => activeWidgets.includes(widget);

  return { canView, appName };
};
