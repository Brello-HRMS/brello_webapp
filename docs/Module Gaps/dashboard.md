# Module: Dashboard (webapp)

## 1. Purpose & Current Usage

- **Files**: `src/features/dashboard/DashboardPage.tsx` is the home page, composing widget cards (`SceneBanner`, `ClockInCard`, `StatCard`, `ApprovalRequestsCard`, `BirthdaysCard`, `AnnouncementCard`, `DailyAttendanceReport`, `EmployeeDailyAttendanceCard`, `HolidaysCard`, `NewHiresCard`) plus the `SetupGuide` checklist widget (`components/SetupGuide/SetupGuide.tsx`).
- Widget visibility is role-gated via `config/dashboardWidgets.ts` (`useDashboardWidgets().canView(...)`, `AppWidgetMapping` keyed by `ADMIN`/`EMPLOYEE`), consumed at `DashboardPage.tsx:53,95-107`.
- `useOrgSetupStatus` (`hooks/useOrgSetupStatus.ts:7-15`) wraps `GET /organization/setup-status` (`api/orgSetup.ts:18-21`) in a shared React Query key (`ORG_SETUP_STATUS_QUERY_KEY`). It is consumed by four independent call sites that all dedupe on the same key: `SetupGuide.tsx:10`, `ClockInCard.tsx:39`, `src/features/sidebar/Sidebar.tsx:123`, and `src/components/common/SetupGuard/SetupGuard.tsx:26-27`.
- `SetupGuard` (`src/components/common/SetupGuard/SetupGuard.tsx`) wraps the `<Outlet/>` in `MainLayout.tsx:54-56` and blocks navigation to any route not in `SETUP_FREE_PATHS` (`SetupGuard.tsx:11-22`) whenever `isAdminApp() && completionPercentage < 100`, rendering `SetupRequiredBlocker` instead of the page.
- Routes referenced by `SetupGuide`'s step links and `SETUP_FREE_PATHS` were verified against `src/routes/adminRoutes.tsx` — all resolve correctly (`/organisation/departments`, `/organisation/designations`, `/organisation/policies`, `/organisation/payroll`, `/organisation/leave-config`, `/attendance/setup`, `/employee/directory`, `/dashboard`). One exception: `/billing` in `SETUP_FREE_PATHS` (`SetupGuard.tsx:21`) has no bare index route (only `/billing/plan`, `/billing/invoice`, `/billing/payments` exist) — harmless today since nothing navigates to the bare path, but latent if it's ever linked to directly.
- **Dead code**: `hooks/useClock.ts` (a self-contained clock-toggle simulator) is not imported anywhere — `useAttendance.ts` is the real implementation actually used by `ClockInCard.tsx:5,37`.

## 2. Intended / Ideal Usage

- Dashboard widgets should each fetch and display real, org-scoped data (attendance, birthdays, holidays, new hires, pending approvals, announcements), gated by role via `dashboardWidgets.ts`.
- `SetupGuide` should give admins an accurate, live checklist mirroring the backend's 7 setup steps, letting them jump to the relevant config page, and should disappear once complete.
- `SetupGuard` should block feature access only while genuinely incomplete, always leave an escape hatch to the pages needed to finish setup, and never leave a user stuck on a blank/loading screen if the status check fails.

## 3. Cross-Module Connections

**Depends on:**
- `GET /organization/setup-status` (backend `OrgSetupService.getSetupStatus`, see `brello_server/docs/Module Gaps/org-setup.md`) — steps `DEPARTMENTS/DESIGNATIONS/COMPANY_POLICIES/PAYROLL/LEAVE/ATTENDANCE/EMPLOYEES` in `api/orgSetup.ts:3-16` match the backend `SetupStatusResponse` exactly (verified against `org-setup.service.ts:14-27`).
- `GET /employees/stats` (`api/employees.ts:46-47`) for the "Total Employees"/"Attendance" stat tiles — but the returned `DashboardStats` type (`api/employees.ts:34-39`) has **no payroll field at all**.
- `getTodayAttendance`/`clockIn`/`clockOut`/`preCheckCheckIn` (`api/attendance.ts`, via `hooks/useAttendance.ts`), `getBirthdays`/`getNewHires` (`api/employees.ts`), `getHolidays` (`api/holidays.ts`), `getAdminDailyPreview` (`api/attendance.ts`, via `hooks/useDailyAttendanceReport.ts`).

**Depends on it (consumers of `useOrgSetupStatus`):** `SetupGuide`, `ClockInCard`, `Sidebar.tsx`, `SetupGuard.tsx` — all four share one query key so client-side network calls are deduplicated to one request per 5-minute `staleTime`.

**Missing/expected connections:**
- `src/features/announcement/api/announcementApi.ts` already exports `getAnnouncements`/`getEmployeeAnnouncements`, and `src/api/leaveRequests.ts` already exports `getPendingApprovals` — fully-built real endpoints that the dashboard's `AnnouncementCard` and `ApprovalRequestsCard` never call (see Gaps §Coding, this is the biggest finding).
- No payroll API is wired into the dashboard despite a dedicated payroll `StatCard`.

## 4. Gaps

### Structural
- **`SetupGuard` fails open on API error, not closed** — `SetupGuard.tsx:32`: `isSetupIncomplete = isAdmin && setupData && setupData.completionPercentage < 100`. If `fetchOrgSetupStatus` errors (network/5xx), `setupData` stays `undefined`, `isSetupLoading` becomes `false` after the single retry (`useOrgSetupStatus.ts:12`), and `isSetupIncomplete` evaluates to `false` — the guard renders `children` unconditionally. This means a backend outage silently **disables** the setup gate app-wide (no stuck loader, but also no gate) rather than trapping users; worth flagging since it's inconsistent with the gate's purpose, though it does avoid a hard lockout.
- **`ClockInCard` is not part of the `DashboardWidget`/`AppWidgetMapping` RBAC system** — `DashboardPage.tsx:48-51` renders `<ClockInCard/>` unconditionally, unlike every other widget which is wrapped in `canView(DashboardWidget.X)` (lines 53, 95-107). Any future app/role that shouldn't show a clock-in widget (e.g. a future contractor-only app type) has no config lever to hide it.

### Coding
- **`ApprovalRequestsCard` and `AnnouncementCard` render permanently hardcoded mock data, not backend data.** `hooks/useDashboard.ts:15-23` hardcodes `approvalItems` (`Leave Request: 3`, `Attendance Regularization: 2`) and `announcementCount: 0` (line 28), and `DashboardPage.tsx:24,32,96,100` feeds this straight into the two cards with no `useQuery`/API call at all — while fully-built real endpoints already exist and are unused (`getPendingApprovals` in `src/api/leaveRequests.ts:16`, `getAnnouncements`/`getEmployeeAnnouncements` in `src/features/announcement/api/announcementApi.ts:28,69`). This matters because every admin sees the same fake "3 Leave Requests, 2 Attendance Regularizations" and "0 announcements" regardless of actual org state — a materially misleading production UI, not a placeholder that only shows in dev.
- **The Payroll `StatCard` is hardcoded and cannot be wired up as-is** — `hooks/useDashboard.ts:13`: `payrollAmount: '₹9,99,999'`, rendered at `DashboardPage.tsx:82-86`. The real stats endpoint's response type (`api/employees.ts:34-39` `DashboardStats`) has no payroll field to bind to even if someone tried, so this isn't just an unwired hook — the type contract for a real value doesn't exist yet.
- **Most of `useDashboard.ts`'s returned data is dead** — `birthdays`, `holidays`, `holidayCount`, `newHires`, `shiftTime`, `shiftDay` (`hooks/useDashboard.ts:24-41`, typed in `types/dashboardTypes.ts:39-49`) are never read by `DashboardPage.tsx`; the real `BirthdaysCard`/`HolidaysCard`/`NewHiresCard` fetch their own live data via `useBirthdays`/`useHolidays`/`useNewHires` instead. This is unused mock surface area that makes the hook's actual contract (2 fields used, 6 unused) misleading to a new contributor.
- **`SetupGuide`'s dismiss (X) does not persist**, only minimize does. `SetupGuide.tsx:16,25-27`: `handleClose` only calls `setIsVisible(false)`, local component state with no `localStorage` write — contrast with `handleMinimizeToggle` (lines 19-23) which does persist via `brello_setup_guide_minimized`. A user who clicks the dismiss "X" will see the widget reappear on every dashboard remount/refresh, which is very likely not the intended behavior given the parallel minimize implementation right next to it.
- **`hooks/useClock.ts` is dead code** — confirmed unused anywhere outside its own file (superseded by `useAttendance.ts`), left in the tree.

### Technical
- **No test coverage**: no `*.test.tsx`/`*.spec.tsx` files exist anywhere under `src/features/dashboard/` — confirmed via directory search — despite `SetupGuide`/`SetupGuard` gating navigation for every admin.
- **Seven independent, un-aggregated API calls fire on a single admin dashboard load**: `employees/stats`, `organization/setup-status`, `attendance/today`, `employees/birthdays`, `holidays`, `employees/new-hires`, and `admin-daily-preview` (`hooks/useDashboardStats.ts`, `useOrgSetupStatus.ts`, `useAttendance.ts`, `useBirthdays.ts`, `useHolidays.ts`, `useNewHires.ts`, `useDailyAttendanceReport.ts`). They run in parallel (no waterfall) and `org-setup-status` is deduped across 4 call sites, but there is no single dashboard-summary endpoint, so every visit to `/dashboard` costs 7 round trips.
- **Accessibility**: `SetupGuide`'s step rows are plain `<div onClick=...>` (`SetupGuide.tsx:41`) and the accordion "next step" link is a `<span onClick=...>` (lines 93-95) — neither has a `role`, `tabIndex`, or keyboard handler, so the entire checklist (which is also the only way to navigate out of a `SetupRequiredBlocker` lockout besides the "Return to Dashboard" button) is unusable via keyboard.

## 5. Top 3 Priorities

1. **Wire `ApprovalRequestsCard` and `AnnouncementCard` to the real, already-built `getPendingApprovals`/`getAnnouncements` endpoints instead of the hardcoded mock counts in `useDashboard.ts`.** This is a live, user-facing correctness bug (admins see fabricated numbers), and the backend work is already done — it's pure wiring.
2. **Fix `SetupGuide`'s dismiss button to persist like minimize does** (`SetupGuide.tsx:25-27`), so dismissing the widget doesn't silently reset on every reload.
3. **Add test coverage for `SetupGuard`'s blocking logic**, especially the error-path behavior (fail-open on fetch error) and the `SETUP_FREE_PATHS` allowlist, since it gates navigation for every admin user and currently has zero automated coverage.
