# Module: ToastFeature (webapp)

## 1. Purpose & Current Usage

`src/features/ToastFeature/` is a thin wrapper around `react-toastify` that gives the app a single "show a transient message" primitive:

- `ShowToast.tsx` — exports `showToast(message, severity)`, which calls react-toastify's `toast()` with a custom render function that mounts `ToastMessage`.
- `ToastMessage.tsx` — presentational component: renders an icon + title (capitalized severity) + message. Severity type is `'success' | 'error' | 'warning' | 'info'`.
- `ToastProvider.tsx` — mounts a single `<ToastContainer>` (top-right, 2s auto-close, no progress bar, draggable, close-on-click) once at app root (`src/app/App.tsx:2,12`).
- `ToastMessage.module.scss` — styling for the custom toast body + an override for `Toastify__close-button`.

There is no store/context/hook beyond this — state is entirely owned by react-toastify internally (`toast()` calls push into its own queue); this feature has no Zustand/Context of its own.

**Consumers (via `showToast`):** 87 files import `showToast` from `ShowToast.tsx` across nearly every feature — attendance, organization, access/roles/users, auth (login/OTP/logout), holidays, platform admin (plans/apps/roles/departments/designations/enterprises/actions/industryTypes/leads), designation, department, policies, project (incl. timesheets/contracts), audit, users, letter-management, employee (incl. wizard/offboarding), client, billing, sidebar. All 87 usages found follow the same call shape: `showToast(message, 'success' | 'error')`.

**Dead/unused parts:**
- `'warning'` and `'info'` severities are defined in `SnackbarSeverity` and wired into `iconMap` (`ToastMessage.tsx:8,15-19`) but **zero** call sites anywhere in `src` ever pass `'warning'` or `'info'` — confirmed via `grep -rn "showToast(.*'warning'\|showToast(.*'info'"` returning no matches. Two of the four severity branches are unreachable dead code.

## 2. Intended / Ideal Usage

A correct toast system for this app would have:
- **One invocation surface.** All success/error/info feedback goes through `showToast(message, severity)` so every toast shares icon, color, layout, and timing rules — never call the underlying toast library directly from feature code.
- **Severity-driven visuals.** Icon and accent color should change with severity (checkmark/green for success, X/red for error, triangle/amber for warning, i/blue for info) so a user scanning the corner of the screen can tell success from failure without reading text.
- **Accessible by default.** `role="alert"`/`aria-live` region (react-toastify supplies this out of the box — verified in `node_modules/react-toastify/dist/unstyled.mjs`, which sets `role:"alert"` and an `aria-live` attribute on the toast wrapper), non-color-only differentiation (icon + text, not just border color) so colorblind users aren't relying on color alone.
- **Sensible auto-dismiss.** Duration should scale with message length/severity — a one-line success toast at 2s is fine, but a long API error message needs longer (or to persist until dismissed) so users can actually read it before it disappears.
- **De-duplication / stacking control.** Repeated identical errors (e.g. a user double-clicking "Save" while a request is in flight) shouldn't stack N identical toasts; a `toastId` keyed by message/context is the standard react-toastify pattern for this.
- **Real-time push integration.** If the backend has a live notification stream, high-priority push events (e.g. "you were assigned a task", "your leave was approved") should be able to surface as a toast, not just update a silent badge.

## 3. Cross-Module Connections

**Depends on:**
- `react-toastify` (`toast`, `ToastContainer`) — the only external dependency.
- `src/assets/Check.svg`, `src/utils/stringUtils.ts` (`capitalize`).

**Depended on by (consumers):** 87 files across nearly every feature folder (list above) — primarily React Query mutation `onSuccess`/`onError` handlers, plus a handful of components (`OrgProfileHeader.tsx`, `AddEmployeeModal.tsx`, `ContractTab.tsx`, `PersonalInfoStep.tsx`, `Login.tsx`, `OtpForm.tsx`, `AddManualEntryModal.tsx`).

**Missing/expected connection — real-time notifications never toast:**
`src/hooks/useNotificationStream.ts:25-60` opens an `EventSource` to `${BRELLO_BASE_API}/notifications/stream` and, on every incoming SSE message, only does `queryClient.setQueryData(NOTIFICATIONS_KEY, ...)` and bumps `UNREAD_COUNT_KEY` (lines 40-45). It never calls `showToast`. So the backend's real-time notification stream (brello_server's notification module) only updates the bell badge/panel silently — a user has to notice the badge count change or open the panel; nothing pops a toast even for events that arguably warrant an immediate interruption (e.g., "your leave request was approved"). This is the one architectural seam explicitly worth flagging: two independent "tell the user something happened" systems (Toast vs. Notifications) exist side by side and never talk to each other.

**Bypass pattern — a second, parallel invocation path:**
13 files import `toast` directly from `react-toastify` and call `toast.success(...)`/`toast.error(...)`, skipping `showToast`/`ToastMessage` entirely:
`src/features/access/permissions/hooks/usePermissions.ts:3,33,51`, `src/features/feedback/components/SubmitFeedbackModal/SubmitFeedbackModal.tsx:5,110`, `src/features/feedback/hooks/useFeedback.ts:2,41,44,61,64`, `src/features/feedback/hooks/usePlatformFeedback.ts:2,50,53,70,73`, `src/features/payroll/hooks/useEmployeePayroll.ts:2,35,38,67`, `src/features/announcement/hooks/useAnnouncement.ts:2,37,40,55,58,72,75,89,92,106,109`, `src/features/leave/hooks/useLeaveConfig.ts:2,66,70`, `src/features/reimbursement/hooks/useReimbursement.ts:2,33,36,54,57,74,77`, `src/features/reimbursement/hooks/useAdminReimbursement.ts:2,33,36,53,56`, `src/components/layout/Header/AppSwitcher.tsx:3,44`, `src/pages/payroll/PayrollEmployeeDetailPage.tsx:4,55,99`, `src/pages/payroll/PayrollConfigPage.tsx:3,136,207`, `src/pages/leave/LeaveConfigPage.tsx:4,82`.
These render react-toastify's default built-in toast body (its own icon/layout), not the custom `ToastMessage`, yet they still inherit the global `toastStyle` (including the hardcoded green border, see Gaps below) from the shared `ToastContainer`.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Two parallel toast invocation paths coexist with no shared abstraction enforcing one.** `showToast()` (87 call sites) renders the custom `ToastMessage` component; 13 files call `toast.success`/`toast.error` from `react-toastify` directly (list above), rendering the library's default toast body. `ToastFeature` does not export a barrel/index that would make `showToast` the only reachable API — feature code can `import { toast } from 'react-toastify'` freely since the dependency is a normal npm package, not something the feature encapsulates. This means payroll, leave, reimbursement, feedback, and announcement flows show visually different toasts than the rest of the app, and any future change to `ToastMessage` (icon, layout, copy) silently doesn't apply to ~13 files. This matters because it defeats the entire purpose of having a shared toast component.
- **No integration point between the SSE notification stream and toasts.** `useNotificationStream.ts:35-49` has no hook or callback for "also toast this," and `showToast` has no subscription mechanism (it's a fire-and-forget function, not an event bus) — so wiring push notifications into toasts today would require bespoke code in the SSE handler rather than a reusable abstraction. This matters because real-time events that should interrupt the user (approvals, assignments) currently rely entirely on the user noticing a badge.

### Coding (bugs, dead code, inconsistent invocation patterns across the app, missing accessibility attributes, unsafe assumptions)

- **All four severities render the identical icon.** `iconMap` in `ToastMessage.tsx:15-20` maps `success`, `error`, `warning`, and `info` all to the same `Check` SVG import. An error toast (e.g. `showToast('Failed to create role', 'error')` in `src/features/access/roles/hooks/useRoles.ts:28`) shows a green checkmark, which is actively misleading — a user glancing at the corner sees a "success" checkmark on a failure message. This is the single clearest bug in the module.
- **Toast border color is hardcoded to green regardless of severity/type.** `ToastProvider.tsx:8` sets `toastStyle.borderLeft: '4px solid #16A34A'` unconditionally on the `ToastContainer`, so every toast — success or error, custom or default react-toastify — gets a green accent bar. Combined with the icon bug above, error toasts have zero visual differentiation from success toasts apart from the text itself.
- **`'warning'` and `'info'` severities are unreachable dead code.** Confirmed via repo-wide grep that no call site ever passes them (see Section 1); the type union and two `iconMap`/switch branches exist but are never exercised, so they're both untested and silently wrong (they'd also show the green check/border per the two bugs above if ever used).
- **No de-duplication of identical/rapid toasts.** `showToast` (`ShowToast.tsx:7-9`) calls `toast()` with no `toastId`, so a double-submit or a retried failing mutation (e.g. spamming "Save" while an error persists) stacks multiple identical toasts rather than replacing/coalescing them (react-toastify supports `toastId` for exactly this, unused here).
- **Fixed 2-second auto-close for all messages regardless of length.** `ToastProvider.tsx:16` sets `autoClose={2000}` globally; error messages sourced from API responses (e.g. `error?.response?.data?.message` patterns used throughout, such as `src/features/access/roles/hooks/useRoles.ts:28`) can be long sentences that get 2 seconds to be read before disappearing, with no severity-based override (e.g. keeping errors open longer or requiring manual dismissal).

### Technical (performance — re-renders, memory leaks from unset timers — accessibility, test coverage)

- **Zero test coverage.** No test file exists for any of the four files in `ToastFeature/` (confirmed via `find src -iname "*toast*test*"` returning nothing) — the icon-mapping bug and border-color bug above would have been caught by a basic snapshot/unit test asserting icon-per-severity.
- **Color is the only differentiator by design, undermined further by the bugs above.** react-toastify does supply `role="alert"`/`aria-live` by default (verified in `node_modules/react-toastify/dist/unstyled.mjs`), so the base accessibility wiring is present; but since icon and border color don't actually vary by severity (see Coding gaps), the visual channel that would help colorblind/low-vision users distinguish success from error is absent in practice, not just in theory.

## 5. Top 3 Priorities

1. **Fix the icon/border-color severity mapping** (`ToastMessage.tsx:15-20`, `ToastProvider.tsx:8`) — this is a live, user-facing bug where every error toast in the app currently displays a green success checkmark, actively miscommunicating failure as success.
2. **Consolidate the two invocation paths** — migrate the 13 files calling `toast.success`/`toast.error` directly (Section 3) onto `showToast`, and consider removing/discouraging the raw `react-toastify` import path so `ToastMessage`'s styling and future accessibility fixes apply everywhere.
3. **Decide whether real-time SSE notifications should also toast**, and if so, wire `useNotificationStream.ts` to call `showToast` for high-priority event types instead of only updating the silent badge/panel — currently a whole class of "something happened to you" events never interrupts the user.
