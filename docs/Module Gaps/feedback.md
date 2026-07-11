# Module: Feedback (webapp)

## 1. Purpose & Current Usage

- Lets org users submit product feedback (feature requests / suggestions / praise) or report issues (bugs / UI-UX / performance / data), track their own tickets in a table, open a detail drawer, and reply in a comment thread. Platform admins get a parallel view across all organisations with status/priority controls, internal notes, and stats tiles.
- Org-facing surface:
  - `src/pages/feedback/FeedbackPage.tsx` — shared page for both "Feedback" and "Report an Issue", driven by a `defaultType` prop (`FeedbackType.FEEDBACK` / `FeedbackType.ISSUE_REPORT`). Uses `useMyTickets` (`src/features/feedback/hooks/useFeedback.ts:12`), `feedbackColumns` (`src/features/feedback/columns/feedbackColumns.tsx`), `SubmitFeedbackModal`, `FeedbackDetailDrawer`.
  - Routed at `support/feedback` and `support/report` in `src/routes/adminRoutes.tsx:348-362`, each wrapped in `<RequireAccess module={ModuleCode.SUPPORT_FEEDBACK|SUPPORT_REPORT}>`.
- Platform-admin surface:
  - `src/pages/platform/PlatformFeedbackPage.tsx` — ticket list + stats tiles (total/open/critical/high) via `usePlatformStats` (`src/features/feedback/hooks/usePlatformFeedback.ts:34`), `platformFeedbackColumns`, `PlatformFeedbackDetailDrawer` (status/priority editing, internal notes, status history timeline).
  - Routed at `support/feedback` / `support/report` in `src/routes/platformAdminRoutes.tsx:40-47` with **no** `RequireAccess` wrapper — platform admin routes bypass the org RBAC gate entirely.
  - Linked from the static platform sidebar menu: `src/features/sidebar/Sidebar.tsx:99-105` (`Support > Feedback`, `Support > Reports`).
- API layer: `src/features/feedback/api/feedbackApi.ts` — org endpoints (`/feedback-tickets`) and platform endpoints (`/platform/feedback-tickets`), including `getPlatformStats` (`:93`).
- Attachments: `SubmitFeedbackModal.tsx` uploads via `uploadDocumentUrl`/`uploadDocumentData` (`src/api/documents`) with `folderType: 'FEEDBACK_ATTACHMENT'` (`SubmitFeedbackModal.tsx:124`), enforcing 10 MB (image) / 50 MB (video) client-side limits.
- Who uses it today: nobody on the org side can currently reach it in a freshly-seeded environment — see Section 3. Platform admins can use the platform view unconditionally since it isn't RBAC-gated.
- No dead files found — every file in `src/features/feedback/` and `src/pages/feedback/` is imported and reachable from a route.

## 2. Intended / Ideal Usage

- An org user with the right role permission sees "Feedback" / "Report an Issue" in their sidebar, submits a ticket (with optional screenshots/video), tracks its status, and gets replies from the Brello team in the same thread — ideally pushed to them in near-real-time or at least surfaced via the existing in-app notification system.
- A platform admin triages incoming tickets across all orgs, changes status/priority, and replies (publicly or as an internal-only note), with the org user reliably notified of the update.

## 3. Cross-Module Connections

- **Depends on**: RBAC/module-access system (`useModuleAccess`, `checkModuleAccess`) to gate the org routes; document upload service for attachments; org-side dynamic sidebar menu (`src/features/sidebar/hooks/useSidebarMenu.ts`) which is itself permission-driven from the backend.
- **Depended on by**: Platform admin support workflow (triage, stats). No other frontend feature imports from `src/features/feedback/`.
- **Missing/expected connection — notifications**: `src/features/notifications/` has no reference to feedback tickets anywhere in the codebase (`grep -rl "feedback" src/features/notifications` returns nothing), and there is no SSE/WebSocket subscription in either drawer component. Combined with `refetchOnWindowFocus: false` in the global query client config (`src/lib/react-query.ts:7`), an org user with `FeedbackDetailDrawer` open will never see a platform admin's reply appear until they manually close/reopen the drawer (which re-fires `useTicketDetail`) — there is no live update path at all.
- **Confirmed: the permission-seeding gap makes the feature invisible to org users today.** The org routes are gated by `RequireAccess module={ModuleCode.SUPPORT_FEEDBACK}` / `SUPPORT_REPORT` (`src/routes/adminRoutes.tsx:350,358`), which resolves through `useModuleAccess` (`src/hooks/useModuleAccess.ts:19-40`) → `checkModuleAccess()` API → the backend's RBAC permission set for the user's role. Per the backend audit, the `FEEDBACK_REPORT` permission is never registered in the RBAC seed system, so no role in a freshly-seeded org can ever have `module_code: SUPPORT_FEEDBACK/SUPPORT_REPORT` with `action_code: view` in that response. The result: `hasViewAccess` is always `false` for every org user, and navigating to `/support/feedback` or `/support/report` renders `ForbiddenPage` (`RequireAccess.tsx:39-41`) unconditionally. In addition, the org sidebar's menu items come from the backend-driven `getMenu()` call (`src/features/sidebar/hooks/useSidebarMenu.ts`), which would also omit a Feedback/Report entry for the same reason — so the feature is doubly hidden: no nav link, and a hard 403 even if the URL is typed directly. Only the platform-admin side (which bypasses `RequireAccess` entirely, see `platformAdminRoutes.tsx:40-47`) is reachable.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **No shared abstraction between the org and platform detail drawers.** `FeedbackDetailDrawer.tsx` and `PlatformFeedbackDetailDrawer.tsx` duplicate ~80% of their layout (meta grid, attachments, comment list, reply box) with copy-pasted `CATEGORY_LABEL` maps (`FeedbackDetailDrawer.tsx:17-25` vs `PlatformFeedbackDetailDrawer.tsx:27-35`) and duplicated attachment-signed-URL-fetching `useEffect`s (`FeedbackDetailDrawer.tsx:42-57` vs `PlatformFeedbackDetailDrawer.tsx:77-92`). Any future change to comment rendering or attachment handling has to be made twice and can drift.
- **Comment thread has no real-time channel**, and nothing wires feedback events into the existing notification system (Section 3). This is a structural gap since the notification infrastructure already exists elsewhere in the app but was never connected here, forcing users to poll by reopening the drawer.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)

- **Reply draft doesn't reset when switching tickets.** `replyBody` state in both `FeedbackDetailDrawer.tsx:36` and `PlatformFeedbackDetailDrawer.tsx:69` is local `useState` with no effect keyed on `ticketId`; if a user types a partial reply, closes the drawer (without sending) and opens a different ticket, the stale draft text carries over into the new ticket's reply box (drawer component doesn't unmount between ticket selections since it's mounted permanently in the page). Same issue applies to `isInternal` toggle in the platform drawer.
- **Blob URL leak in the attachment uploader.** `SubmitFeedbackModal.tsx` creates `previewUrl = URL.createObjectURL(file)` (`:115`) and only revokes it in `removeFile` (`:148`). If the user closes the modal (Cancel) or successfully submits without removing a file, `uploadedFiles` is reset to `[]` on next open (`:97`) without calling `URL.revokeObjectURL`, leaking the blob URL for the session's lifetime.
- **Inconsistent/likely-inert zod error customization.** `feedbackSchema.ts:20-23` uses the zod v3-style `required_error` option (`z.enum([...], { required_error: ... })`, `z.nativeEnum(FeedbackCategory, { required_error: ... })`), but `package.json` pins `"zod": "^4.3.6"` and no other schema file in the codebase uses `required_error` (they use plain `z.nativeEnum(...)` or the v4 `error` callback style) — this is the only file using this pattern, so the custom required-field messages likely never surface as intended.
- **Silent swallow of upload failures.** `handleFileChange`'s catch block (`SubmitFeedbackModal.tsx:135-140`) only flips a per-file `error` flag with no `console.error`/logging and no toast, so a failed attachment upload is easy to miss compared to every other mutation in this feature, which does show `toast.error` (`useFeedback.ts:44`, `usePlatformFeedback.ts:53,72`).

### Technical (performance, security, accessibility, test coverage)

- **No automated tests** exist anywhere under `src/features/feedback/` or `src/pages/feedback/` (no `.test.ts(x)` or `.spec.ts(x)` files) — the entire submit → view → reply → platform-triage flow, plus the permission gate itself, is unverified by CI.
- **Feature is currently unreachable end-to-end for the primary audience** (org users) due to the RBAC seeding gap (Section 3) — this is a severe availability/security-adjacent gap since the shipped UI (routes, drawer, submit modal) is effectively dead code in production until the backend seed is fixed, regardless of how well-built the components themselves are.

## 5. Top 3 Priorities

1. **Fix the RBAC seed gap so `SUPPORT_FEEDBACK`/`SUPPORT_REPORT` are grantable** (tracked as a backend fix, but blocking here) — until then, this entire, otherwise-functional frontend feature is invisible and unusable by every org user, making it the single highest-impact issue in this module.
2. **Wire ticket replies/status changes into the notification system (or at minimum poll while the drawer is open)** — without any push or refetch mechanism, org users have no way to know a platform admin responded short of reopening the drawer, undermining the whole point of a support/feedback loop.
3. **Deduplicate `FeedbackDetailDrawer`/`PlatformFeedbackDetailDrawer` into a shared base component** — the near-identical, copy-pasted structure (category labels, attachment fetching, comment list) is a maintenance risk that will cause the two views to silently diverge as the feature evolves.
