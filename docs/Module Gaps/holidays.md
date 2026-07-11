# Module: Holidays (webapp)

## 1. Purpose & Current Usage

The frontend Holiday feature has two parts:

- **`src/features/holidays/`** — the reusable layer: `api/holidayApi.ts` (7 REST calls: `getCalendars`, `createCalendar`, `activateCalendar`, `deleteCalendar`, `getCalendarHolidays`, `addHoliday`, `deleteHoliday`, `getUpcomingHolidays`), `hooks/useHolidays.ts` (React Query wrappers around each), `types/index.ts` (`Holiday`, `Calendar`, request/response shapes), and dialog/card components (`AddCalendarDialog.tsx`, `AddHolidayDialog.tsx`, `HolidayCard.tsx`).
- **`src/pages/holidays/`** — the routed pages: `HolidaysPage.tsx` (grid of `HolidayCard`s, one per year's calendar) and `HolidayCalendarView.tsx` (per-calendar detail: month calendar view via `react-big-calendar` or a `DataTable` list view, plus add/delete holiday actions).

Routes: `src/routes/adminRoutes.tsx:194-209` registers `attendance/holidays` → `HolidaysPage` and `attendance/holidays/:id` → `HolidayCalendarView`, both wrapped in `<RequireAccess module={ModuleCode.LEAVE_HOLIDAYS}>`.

Other consumers:
- `src/features/dashboard/components/HolidaysCard/HolidaysCard.tsx:4,9` — dashboard "Holidays in `<Month>`" widget, gated by `DashboardWidget.HOLIDAYS` (`src/features/dashboard/DashboardPage.tsx:104`).
- `src/pages/attendance/DailyPreviewPage.tsx:104-105` — maps a `'HOLIDAY'` attendance-status enum value to the label "Holiday" (consumes attendance's own status field, not the calendar data directly).

**Dead/unused parts:**
- `useUpcomingHolidays` (`src/features/holidays/hooks/useHolidays.ts:162-179`) and its underlying `getUpcomingHolidays` (`src/features/holidays/api/holidayApi.ts:60-62`) are exported but never imported/called anywhere in the codebase — the dashboard widget that should use them instead has its own parallel implementation (see Gap below).
- `HolidayCard`'s `onEdit` prop (`src/features/holidays/components/HolidayCard.tsx:13,16`) is accepted but never destructured/used in the component body, and `HolidaysPage.tsx:32-34` wires it to a literal no-op (`// TODO: Implement Edit`). There is also no "Edit" button rendered anywhere in `HolidayCard.tsx` — the affordance doesn't exist in the UI at all, only the dead prop plumbing.

## 2. Intended / Ideal Usage

An org admin/HR role opens Holidays from the sidebar, sees one card per yearly calendar (active/inactive), creates a new calendar (optionally cloned from a prior year), opens a calendar to add/remove dated `PUBLIC`/`OPTIONAL`/`COMPANY` holidays via a month-grid or list view, and activates the calendar that should drive attendance auto-marking and leave-day billing for that year. Regular employees see a read-only "upcoming holidays" surface (dashboard widget) sourced from the same `/employee/holidays` endpoint.

## 3. Cross-Module Connections

**Depends on:**
- `apiClient`/`envVars` (`lib/axios`, `utils/envVars`) for all requests.
- `RequireAccess` + `useModuleAccess` (`src/components/common/RequireAccess/RequireAccess.tsx`, `src/hooks/useModuleAccess.ts`) for route gating, keyed on `ModuleCode.LEAVE_HOLIDAYS` (`src/enum/modules.ts:20`).
- The dynamic sidebar menu, fetched from `GET /menu` (`src/features/sidebar/api/sidebar.ts:6-8`) — the "Holidays" nav entry's visibility is backend-driven, not a static frontend config (no `holiday` reference exists anywhere in `src/features/sidebar/sidebarConfig.ts`).
- `react-big-calendar` + `moment` for the month-grid view.

**Depended on by:**
- `HolidaysCard` dashboard widget (`src/features/dashboard/components/HolidaysCard/HolidaysCard.tsx`) — but see Gap below, it does not actually depend on this feature's code.
- Attendance's daily preview page consumes a `'HOLIDAY'` status label only (loosely coupled, no calendar data fetched directly).

**Missing or expected connections — verified against the backend RBAC gap:**
The backend audit (`brello_server/docs/Module Gaps/holiday.md`) found that every Holiday admin endpoint requires permission `LEAVE_HOLIDAYS`, but the seeded RBAC module catalog only defines `HOLIDAY` — so `PermissionResolverService.hasPermission` always returns `false` for that code, and `AccessGuard` 403s. I confirmed the frontend reproduces and is fully blocked by this same gap, not just theoretically:
- `src/routes/adminRoutes.tsx:197,205` gates both holiday routes on `ModuleCode.LEAVE_HOLIDAYS` — the exact same string as the backend's non-existent permission key.
- `useModuleAccess` (`src/hooks/useModuleAccess.ts:24-38`) builds its access map by matching `item.module_code === moduleCode` against the response of `GET /menu/permissions`; since no permission row for `LEAVE_HOLIDAYS` can ever exist (the module isn't seeded), `hasViewAccess` is always `false` for every non-platform-admin user.
- `RequireAccess.tsx:39-41` renders `<ForbiddenPage />` whenever `hasViewAccess` is false.
- Net effect: **any real, non-platform-admin user who navigates to `/attendance/holidays` or `/attendance/holidays/:id` today gets a 403 ForbiddenPage, unconditionally.** The admin UI code (`HolidaysPage`, `HolidayCalendarView`, both dialogs) is otherwise complete and would work correctly — it is unreachable purely because of the RBAC seed gap, not a frontend defect. Only platform admins (who bypass `AccessGuard` entirely per the backend audit) can reach it.
- Additionally, because the sidebar menu is populated from the same backend permission/module data (`GET /menu`), the "Holidays" nav link itself is almost certainly never rendered for non-platform-admin users either — the feature is invisible, not just blocked, for the same underlying reason.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

1. **Duplicate, parallel "upcoming holidays" implementations.** `src/api/holidays.ts` (`getHolidays`, hitting `GET /employee/holidays`) and `src/features/holidays/api/holidayApi.ts:60-62` (`getUpcomingHolidays`, hitting the same endpoint) are two independent client wrappers around the identical backend route, with two separate type definitions (`HolidayItem` in `src/features/dashboard/types/dashboardTypes.ts:17-22` vs `Holiday` in `src/features/holidays/types/index.ts:3-10`) and two separate hooks (`src/features/dashboard/hooks/useHolidays.ts` vs `src/features/holidays/hooks/useHolidays.ts:162-179`). Matters because the "canonical" hook (`useUpcomingHolidays`) is dead code while the dashboard silently reimplements the same fetch/filter logic — any future change to the endpoint's shape must be made in two places, and already risks drift (e.g., date-filtering logic only exists in the dashboard's copy, `dashboard/hooks/useHolidays.ts:16-19`).
2. **No "Edit Calendar" capability, despite dead plumbing for it.** `HolidaysPage.tsx:32-34` defines `handleEditCalendar` as a literal no-op TODO, and `HolidayCard.tsx:13,16` declares an `onEdit` prop that is never used in the component (no edit button exists). Matters because it signals an intended feature (renaming/adjusting a calendar) that was scaffolded but never built, leaving users with no way to fix a calendar's name/year after creation short of delete-and-recreate.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)

1. **`AddCalendarDialog`'s "Status" and "Clone from previous year" controls are non-functional UI.** `isActive` and `copyPrevious` state (`AddCalendarDialog.tsx:20-21`) are rendered as toggles the user can flip, but `handleSubmit` (`AddCalendarDialog.tsx:30-36`) only sends `{ name, year }` to `useCreateCalendar`/`createCalendar` — matching `CreateCalendarRequest` (`types/index.ts:24-27`), which has no `is_active`/`copy_previous` fields at all. Matters because the dialog visually promises "set initial status" and "clone holidays from last year," but flipping either toggle has zero effect — a misleading UI that silently discards user intent.
2. **Month-view calendar navigation is not bounded to the calendar's own year, and can desync the toolbar label from the actual data shown.** `HolidayCalendarView.tsx:36` initializes `currentDate` to `new Date()` (today) regardless of which calendar (which year) is being viewed, and there is no effect syncing it to `calendar.year` once the calendar loads. Navigating with `react-big-calendar`'s prev/next (`onNavigate`, line 226) changes `currentDate` freely across month *and year* boundaries, but the query only ever sends `month` (`currentDate.getMonth() + 1`, line 46) to `getCalendarHolidays` (`holidayApi.ts:38-47`) — the year component of navigation is silently dropped. Matters because for any calendar not matching the current real-world year (e.g. opening a 2024 or 2027 calendar), the toolbar can show a year label (e.g. "December – 2025") that has no relationship to the actual calendar/year of data being fetched (the 2024 calendar's data), which is confusing and can look like missing/wrong holidays.
3. **No client-side validation that a new holiday's date falls within its calendar's year.** `AddHolidayDialog.tsx` collects `date` via a plain `DatePicker` (line 91) with only a "required" check (line 76) — nothing cross-checks the picked date's year against the calendar being edited (`calendarId` is passed through untouched, lines 26-58). Matters because a user can add a holiday dated in a completely different year than the calendar they opened, with no frontend guard to catch the mistake before it reaches the API.
4. **Accessibility: color-swatch selectors are non-keyboard-operable.** The category-color picker in `AddHolidayDialog.tsx:106-113` renders each swatch as a `<div>` with only an `onClick` handler — no `role="button"`, `tabIndex`, or `onKeyDown`/`onKeyPress` handler. Matters because keyboard-only and screen-reader users cannot select a holiday color at all, blocking form completion via assistive tech.

### Technical (performance, security, accessibility, test coverage)

1. **No automated tests.** No `*.test.*`/`*.spec.*` file exists anywhere under `src/features/holidays/` or `src/pages/holidays/`. Matters because the calendar/holiday CRUD flows (create, activate, delete, add/remove holiday) have no regression safety net, and the month-view flattening logic in `useCalendarHolidays` (`useHolidays.ts:106-114`) — which reshapes the backend's per-day grouping into a flat list — has non-trivial branching that would benefit from a unit test.
2. **Frontend is fully blocked from real-world use by the backend RBAC seeding gap.** As detailed in Section 3, the entire admin surface (`HolidaysPage`, `HolidayCalendarView`, both dialogs) renders `ForbiddenPage` for every non-platform-admin user today, and the "Holidays" sidebar entry is likely never shown to them either since the nav menu is permission-driven. Matters because this is a live, user-facing outage on the frontend side of an otherwise-complete feature, not a hypothetical risk — it is the single biggest reason this module currently delivers zero value to any real (non-platform-admin) customer.

## 5. Top 3 Priorities

1. **Fix the `LEAVE_HOLIDAYS`/`HOLIDAY` RBAC module-code mismatch (shared with backend).** This is the dominant issue: it doesn't matter how complete or correct the rest of the frontend is (dialogs, calendar view, list view) if no real user can ever pass `RequireAccess` to reach it. Fix belongs primarily in the backend seed/permission alignment, but frontend should verify `ModuleCode.LEAVE_HOLIDAYS` matches whatever code is chosen.
2. **Fix the calendar month-navigation year desync in `HolidayCalendarView.tsx:36,46`.** Once the RBAC gap is fixed and real users can reach this page, this bug will immediately surface as "wrong/missing holidays" confusion for any calendar year other than the current one.
3. **Remove or wire up the dead "Status"/"Clone from previous year" toggles in `AddCalendarDialog.tsx`.** Either implement clone-on-create and initial-status support end-to-end (frontend already has the UI and `HolidayCalendarService.clone` exists server-side per the backend audit) or remove the misleading controls — currently the UI actively lies about what the "Create calendar" action will do.
