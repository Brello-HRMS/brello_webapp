import PlatformDashboardPage from '../pages/platform/PlatformDashboardPage';
import PlatformIndustryTypePage from '../pages/platform/PlatformIndustryTypePage';
import PlatformDepartmentPage from '../pages/platform/PlatformDepartmentPage';
import PlatformDesignationPage from '../pages/platform/PlatformDesignationPage';
import PlatformPlansPage from '../pages/platform/PlatformPlansPage';
import PlatformAppsPage from '../pages/platform/PlatformAppsPage';
import PlatformModulesPage from '../pages/platform/PlatformModulesPage';
import PlatformActionsPage from '../pages/platform/PlatformActionsPage';
import PlatformPlanPermissionsPage from '../pages/platform/PlatformPlanPermissionsPage';
import PlatformLeadsPage from '../pages/platform/PlatformLeadsPage';
import PlatformEnterprisesPage from '../pages/platform/PlatformEnterprisesPage';
import PlatformOrganizationsPage from '../pages/platform/PlatformOrganizationsPage';
import PlatformOrganizationDetailPage from '../pages/platform/PlatformOrganizationDetailPage';
import PlatformRolesPage from '../pages/platform/PlatformRolesPage';
import PlatformAccessPermissionsPage from '../pages/platform/PlatformAccessPermissionsPage';
import PlatformLettersPage from '../pages/platform/PlatformLettersPage';
import PlatformFeedbackPage from '../pages/platform/PlatformFeedbackPage';
import { FeedbackType } from '../features/feedback/types/feedbackTypes';

import type { RouteObject } from 'react-router-dom';

export const platformAdminRoutes: RouteObject[] = [
  { path: 'dashboard', element: <PlatformDashboardPage /> },
  { path: 'leads', element: <PlatformLeadsPage /> },
  { path: 'enterprises', element: <PlatformEnterprisesPage /> },
  { path: 'organizations', element: <PlatformOrganizationsPage /> },
  { path: 'organizations/:orgId', element: <PlatformOrganizationDetailPage /> },
  { path: 'plans', element: <PlatformPlansPage /> },
  { path: 'roles', element: <PlatformRolesPage /> },
  { path: 'access/roles', element: <PlatformRolesPage /> },
  { path: 'access/permissions', element: <PlatformAccessPermissionsPage /> },
  { path: 'apps', element: <PlatformAppsPage /> },
  { path: 'modules', element: <PlatformModulesPage /> },
  { path: 'plans/:planId/permissions', element: <PlatformPlanPermissionsPage /> },
  { path: 'setup/actions', element: <PlatformActionsPage /> },
  { path: 'setup/industry-types', element: <PlatformIndustryTypePage /> },
  { path: 'setup/departments', element: <PlatformDepartmentPage /> },
  { path: 'setup/designations', element: <PlatformDesignationPage /> },
  { path: 'letters', element: <PlatformLettersPage /> },
  {
    path: 'support/feedback',
    element: <PlatformFeedbackPage defaultType={FeedbackType.FEEDBACK} />,
  },
  {
    path: 'support/report',
    element: <PlatformFeedbackPage defaultType={FeedbackType.ISSUE_REPORT} />,
  },
];
