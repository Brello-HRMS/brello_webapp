# Module: Attendance (webapp)

## 1. Purpose & Current Usage

The frontend attendance surface is split across two unrelated locations that both claim the name "attendance":

- **Actual clock-in/out (employee-facing, daily use)** lives outside `src/features/attendance/` entirely, in the **dashboard** feature:
  - `src/features/dashboard/components/ClockInCard/ClockInCard.tsx` — the widget every employee sees on the dashboard, with a live timer, shift display, location status, and Clock In/Out button.
  - `src/features/dashboard/hooks/useAttendance.ts` — owns geolocation, pre-check, check-in/check-out, and React Query cache invalidation. Calls `src/api/attendance.ts` (`clockIn`, `clockOut`, `getTodayAttendance`, `preCheckCheckIn`).
  - `src/features/dashboard/components/ClockInCard/LateClockInModal.tsx` — shown when the pre-check flags a late or remote check-in; collects a reason via radio buttons + free text.
- **`src/features/attendance/`** is actually the **admin setup + admin daily-preview** feature:
  - `setup/components/{ShiftsTab,WeeklyOffsTab,RulesTab,AssignTab}.tsx` + matching hooks (`useShifts`, `useWeeklyOffs`, `useRules`, `useAssignments`) — shift/rule/weekly-off CRUD and rule→department/employee assignment, driving `src/pages/attendance/setup/AttendanceSetupPage.tsx` (route `attendance/setup`).
  - `hooks/useAttendance.ts` (a **second, differently-scoped hook of the same name**) — wraps `api/attendanceApi.ts` with React Query mutations (`useDailyPreview`, `useCheckIn`, `useCheckOut`, `useManualEntry`), used by `src/pages/attendance/DailyPreviewPage.tsx` (route `attendance/daily`) and `src/components/attendance/AddManualEntryModal.tsx`.
- Routes wired in `src/routes/adminRoutes.tsx:170-217`: `attendance/balance` → `LeaveManagementPage`, `attendance/requests` → `LeaveRequestsPage`, `attendance/daily` → `DailyPreviewPage`, `attendance/holidays[/​:id]`, `attendance/setup` → `AttendanceSetupPage`. All are admin-only (wrapped in `RequireAccess`); there is no employee-side route under `src/routes/employeeRoutes.tsx` for attendance at all (it only has `reimbursement/me`, `announcements/me`, `letters/me`).
- Dead/unrouted files found in `src/pages/attendance/`:
  - `EmployeeProfilePage.tsx` — not imported by any route file (`adminRoutes.tsx:21` routes `employee/profile/:id` to a *different* component, `pages/Employee/Profile/EmployeeProfilePage`). The file is 100% hardcoded mock data (`ATTENDANCE_LOG` array, `"John Doe"`, static chart bars) with no API calls anywhere in it.
  - `geofencing/GeoFencingPage.tsx` — `grep` for `GeoFencingPage` across `src/` returns only its own file; it is not referenced by any route. Its own content is an explicit placeholder: `NoDataFound title="Geo Fencing Under Development"` (`GeoFencingPage.tsx:16-21`).
- Dead hooks: `src/features/dashboard/hooks/useClock.ts` is a self-contained timer hook (`isClockedIn`/`toggle`/`formattedTime`) that is never imported anywhere (`grep` for `useClock` finds zero importers) — `ClockInCard` uses `dashboard/hooks/useAttendance.ts` instead, which duplicates the same timer logic independently. Similarly, `useCheckIn`/`useCheckOut` exported from `features/attendance/hooks/useAttendance.ts:35-69` have zero callers anywhere in `src/` (only `useManualEntry` from that file is used, by `AddManualEntryModal.tsx:6,56`).

## 2. Intended / Ideal Usage

- One employee clocks in via `ClockInCard`, geolocation is captured, a pre-check tells them if they're late or off-site, they optionally supply a reason, and they get a clear signal both immediately (toast/badge) and later (once a manager acts) about whether their reason was accepted.
- Admins configure shifts/rules/weekly-offs/geo-fences once in `AttendanceSetupPage`, assign them to departments/employees, and see daily/employee-level attendance in `DailyPreviewPage` / an employee profile drill-down, with working filter/sort/export/action controls.
- An employee who disputes an auto-checkout or missed punch can submit a correction (regularization) request from within the webapp and see its status change from pending → approved/rejected, mirroring the backend's `CorrectionRequestService` and the `attendance.correction.approved` / `attendance.correction.rejected` notification types that already exist in the notification system's type registry.

## 3. Cross-Module Connections

**Depends on:**
- `src/api/attendance.ts` and `src/features/attendance/api/attendanceApi.ts` — two independent Axios wrapper modules hitting the same `/attendance/*` backend routes.
- `src/features/dashboard/hooks/useOrgSetupStatus.ts` — gates the Clock In button when org setup is incomplete (`ClockInCard.tsx:39-51`).
- `src/features/department/hooks/useDepartments.ts`, `src/hooks/useEmployees.ts` — feed `AssignTab.tsx` dropdowns.
- `src/features/notifications/*` — `notificationApi.ts:28-29` and `NotificationSettings.tsx:53-59` define user-facing preference toggles for `attendance.correction.approved` / `attendance.correction.rejected`.

**Depends on this:**
- `src/features/dashboard/DashboardPage.tsx` renders `ClockInCard`.
- Admin daily preview/audit flows consume `getAdminDailyPreview`/`getDailyPreview` from both API modules.

**Missing or expected connections (notification gap surfacing in the UI):**
- `LateClockInModal.tsx:213-216` explicitly tells the employee: *"Your reason will be shared with your reporting manager for approval."* Per the backend audit (`brello_server/docs/Module Gaps/attendance.md` §3), `remote-approval.service.ts` has no working notification trigger — the manager is never actually notified. The UI asserts a hand-off that does not happen; the employee has no way to discover this and will reasonably assume their manager was pinged.
- `NotificationSettings.tsx:53-59` exposes toggles labeled **"Correction approved"** and **"Correction rejected"** mapped to `event_type: 'attendance.correction.approved'/'rejected'`. Per the backend audit, `CorrectionRequestService.approve()/reject()` never emits these events — the toggle configures a notification pathway that structurally cannot fire. Worse, there is no employee-facing UI anywhere in `src/features/attendance/` or `src/pages/attendance/` to actually *submit* a correction/regularization request in the first place (`grep -ri correction` across `src/` returns only these two notification-settings references) — so the settings page implies a feature exists end-to-end when neither the submission UI nor the notification delivery does.
- The `ClockInCard` does render a live `attendanceStatus` badge including a `status_pending_approval` style (`ClockInCard.module.scss:77`), so an employee can see "Pending Approval" on their own dashboard — but there is no follow-up UI (no detail view, no history, no re-fetch-on-resolution signal) telling them when/if that status changes, and combined with the missing manager notification, both sides of the approval loop are silent.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Two parallel attendance API layers and two same-named `useAttendance` hooks.** `src/api/attendance.ts` (used by `features/dashboard/hooks/useAttendance.ts` for real clock-in/out) and `src/features/attendance/api/attendanceApi.ts` (used by `features/attendance/hooks/useAttendance.ts` for admin daily-preview + unused check-in/out mutations) independently wrap the same `/attendance/*` backend endpoints with different envelope-unwrapping logic. Matters because a backend response-shape change has to be fixed in two places, and the naming collision (`useAttendance` in both `features/dashboard/hooks/` and `features/attendance/hooks/`) makes it easy to import the wrong one.
- **The `attendance` feature folder does not contain the attendance feature employees actually use.** Clock-in/out, geolocation, and the late/remote-reason flow live entirely under `src/features/dashboard/`, while `src/features/attendance/` is admin setup + admin preview only. Matters because anyone looking for "where does clock-in live" by feature-folder convention will find the wrong code and duplicate effort.
- **No employee-facing correction/regularization request UI exists**, even though the backend has a full `CorrectionRequestService` and the notification system has dedicated `attendance.correction.*` event types wired into settings (`NotificationSettings.tsx:53-59`). Matters because a whole approval workflow (submit → manager review → approve/reject) is dark on the frontend; users cannot dispute a missed punch or wrong auto-checkout at all today.
- **Two admin-facing pages are orphaned/unrouted**: `src/pages/attendance/EmployeeProfilePage.tsx` (fully mock data, no route) and `src/pages/attendance/geofencing/GeoFencingPage.tsx` (explicit "Under Development" placeholder, no route). Matters because dead pages accumulate silently and can mislead future contributors into thinking these are the live implementations of employee-profile attendance and geo-fencing.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling)

- **Dead hooks with zero callers.** `src/features/dashboard/hooks/useClock.ts` (entire file unused) and `useCheckIn`/`useCheckOut` in `src/features/attendance/hooks/useAttendance.ts:35-69` (no importers anywhere in `src/`) duplicate logic that is implemented separately elsewhere and never gets exercised or maintained.
- **Hardcoded, non-dynamic pending-count text.** `src/pages/attendance/LeaveRequestsPage.tsx:12` renders a literal string `"You have 7 Pending Leave Requests that need action!"` regardless of the actual data rendered by `LeaveRequestsListView` below it — the "7" is not derived from any query result.
- **Non-functional toolbar/action buttons.** `src/pages/attendance/DailyPreviewPage.tsx:189-199` (Filter/Sort/Export icon buttons) and `:261-265` (per-row `MoreVertical` "Actions" button) render with no `onClick` handlers at all — they look interactive but do nothing.
- **`EmployeeProfilePage.tsx` is 100% hardcoded mock data** (`ATTENDANCE_LOG` array at lines 6-47, static `"John Doe"` profile, static chart bar heights) — separate from the routing issue above, it has zero API integration even in isolation.
- **Geolocation denial has no recovery path.** `src/features/dashboard/hooks/useAttendance.ts:46-63` calls `navigator.geolocation.getCurrentPosition` exactly once on mount; on denial it sets `locationStatus = 'denied'` permanently for the component's lifetime. `ClockInCard.tsx:78-87` shows a static message ("Enable it in your browser to clock in") with no retry/"try again" button — the only recovery is a full page reload, and the Clock In button stays disabled the whole session (`ClockInCard.tsx:44-51`).
- **No offline/retry handling for check-in/check-out.** `handleConfirmCheckIn`/`handleCheckOut` (`features/dashboard/hooks/useAttendance.ts:99-163`) catch request failures and only set an error string; there is no retry queue, backoff, or offline-detection, so a clock-in submitted during a network drop just fails silently until the employee notices the error text and clicks again.
- **Hardcoded locale for date/day formatting.** `src/utils/timeUtils.ts:25-35` (`formatFullDate`, `getDayName`) hardcode `'en-IN'` as the `toLocaleDateString` locale regardless of the viewing user's actual locale/timezone, and the shift time range shown in `ClockInCard` (`shiftDisplay`, built in `dashboard/hooks/useAttendance.ts:169-171`) has no timezone label at all — for any org with employees outside IST, the displayed day name/date and shift hours have no stated frame of reference.

### Technical (performance, accessibility, test coverage)

- **Zero test files.** `find` across `src/features/attendance/`, `src/pages/attendance/`, and `src/features/dashboard/` for `*.test.*`/`*.spec.*` returns nothing — none of the check-in/out flow, geolocation branching, pre-check modal logic, or admin setup CRUD hooks have any automated coverage.
- **External CDN dependency at runtime with no fallback.** `LateClockInModal.tsx:16-18` pulls Leaflet marker icons from `unpkg.com` and map tiles from `{s}.tile.openstreetmap.org` (`:158`) on every late/remote check-in — if either is blocked (corporate network, offline), the modal's map silently fails to render icons/tiles with no error state or local fallback, right in the middle of the one flow that's supposed to reassure the user their location was verified.
- **Icon-only buttons without accessible labels.** The `MoreVertical` "Actions" buttons in `DailyPreviewPage.tsx:262-264` and `EmployeeProfilePage.tsx:174-176` have no `aria-label`/`title`, unlike the neighboring Filter/Sort/Export buttons which do use `title`.

## 5. Top 3 Priorities

1. **Stop implying a notification/approval hand-off that doesn't exist.** `LateClockInModal.tsx:213-216`'s "shared with your reporting manager for approval" copy and `NotificationSettings.tsx:53-59`'s "Correction approved/rejected" toggles both promise a workflow the backend never completes (per the backend audit, `remote-approval.service.ts` and `correction-request.service.ts` have no working notification triggers) — this is an active trust/compliance risk since employees believe their manager was informed when nobody was.
2. **Build (or explicitly remove) the missing employee-facing correction/regularization request UI.** The backend has a full `CorrectionRequestService` and the notification type registry already has `attendance.correction.*` entries, but there is no submission surface anywhere in `src/features/attendance/` or `src/pages/attendance/` — right now the feature is half-wired from the frontend's perspective (settings exist, submission doesn't).
3. **Consolidate the duplicated attendance API/hook layers and delete dead code.** Two `useAttendance` hooks, two API wrapper modules, an unused `useClock.ts`, and unused `useCheckIn`/`useCheckOut` mutations create real risk of someone extending/fixing the wrong copy; pair this with removing (or finishing and routing) the orphaned `EmployeeProfilePage.tsx` and `GeoFencingPage.tsx`.
