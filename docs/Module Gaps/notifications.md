# Module: Notifications (webapp)

## 1. Purpose & Current Usage

- Bell icon in the header opens a right-side `Dialog` panel (`NotificationPanel`) with tabs — All, Unread, Requires Action, Approvals, Attendance — plus a gear icon that swaps the list for an inline `NotificationSettings` preferences table (channel x event-type toggles + a push-permission banner).
- Notifications are fetched via REST (`getAllNotifications`, `getUnreadCount`) and kept live via a single SSE connection (`useNotificationStream`) mounted once in `MainLayout`, which pushes new items directly into the React Query cache.
- Files and wiring:
  - `src/components/layout/Header/Header.tsx:14-15,34,147-158,188` — bell button, unread-count query, renders `NotificationPanel`.
  - `src/components/layout/MainLayout.tsx:8,17` — mounts `useNotificationStream()` once per session.
  - `src/hooks/useNotificationStream.ts:25-60` — EventSource connection, writes into `NOTIFICATIONS_KEY`/`UNREAD_COUNT_KEY`.
  - `src/features/notifications/hooks/useNotifications.ts:15-74` — React Query hooks for list, unread count, mark-read, mark-all-read, preferences.
  - `src/features/notifications/components/NotificationPanel/NotificationPanel.tsx` — tabs, date grouping, mark-read actions.
  - `src/features/notifications/components/NotificationItem/NotificationItem.tsx` — single row, click-to-mark-read only.
  - `src/features/notifications/components/NotificationSettings/NotificationSettings.tsx` — preferences table + push opt-in banner (uses `src/hooks/usePushSubscription.ts` and `public/sw.js`).
  - `src/features/notifications/api/notificationApi.ts` — REST client + `mapNotification` (maps `metadata.event_type` to UI `NotificationType`/icon) + Web Push registration calls.
- Dead/unused: `src/features/notifications/data/dummyNotifications.ts` (`DUMMY_NOTIFICATIONS`, 26 fixture rows) is never imported anywhere (confirmed via repo-wide grep) — leftover from before the real API was wired up.

## 2. Intended / Ideal Usage

- Bell badge and panel update instantly as domain events happen (leave approved, reimbursement submitted, etc.), reachable from every screen size, with an at-a-glance unread count.
- Clicking a notification should both mark it read and deep-link to the relevant entity (the leave request, the reimbursement, etc.).
- SSE should transparently recover from drops/expired auth without the notification stream going silently stale.
- Preferences should only expose channels that can actually deliver something; enabling a toggle should have an observable effect.

## 3. Cross-Module Connections

- **Depends on**: backend `notifications` module — `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET|PATCH /notifications/preferences`, `GET /notifications/vapid-public-key`, `POST|DELETE /notifications/push-subscription`, and the SSE stream at `GET /notifications/stream` (`notificationApi.ts:59-134`, `useNotificationStream.ts:32`).
- **Depended on by**: only `Header.tsx` (bell + panel mount) and `MainLayout.tsx` (SSE hook). No other feature imports anything from `src/features/notifications`.
- **ToastFeature relationship**: confirmed fully independent. `useNotificationStream.ts:35-49` only calls `queryClient.setQueryData`; it never calls `showToast` (`src/features/ToastFeature/ShowToast.tsx`). `ToastProvider`/`showToast` (react-toastify) are used elsewhere purely for imperative API success/error messages and have zero awareness of the notification domain. A real-time notification arriving over SSE produces no toast and no count on the bell (see Gaps) — a user has to actively open the panel to notice anything happened.
- **Missing connection**: `NotificationItem` never uses `metadata` for navigation — there is no link from a notification back to the source entity (leave request, reimbursement, etc.), even though `mapNotification` (`notificationApi.ts:45-57`) already parses `metadata` for `event_type`/`requires_action` and could carry an entity id/URL.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Notification bell is unreachable below 801px width.** `Header.tsx:75,79-86,147`: the bell button only renders `{isDesktop && showNotification && ...}` inside `{isDesktop && (...)}` gated on `showNotification = useMediaQuery('(min-width: 801px)')`. Below that width the code instead adds a "Notification" entry to `profileActionItems`, but its `action` is `() => setIsProfileOpen(false)` (`Header.tsx:84`) — it only closes the profile dropdown and never calls `setIsNotificationOpen(true)`. On any viewport narrower than 801px (tablets, many laptops, all mobile) there is no working UI entry point to notifications at all — the feature is silently dead there.
- **No click-through / deep-link from a notification to its source entity.** `NotificationItem.tsx:42-44`: `handleClick` only calls `onMarkRead`; there is no navigation. Combined with tabs like "Requires Action" and "Approvals" that imply actionable items, this leaves the panel as a read-only feed with no way to act on what it surfaces.
- **Toast and Notification systems are architecturally disconnected** (see Cross-Module Connections) — there is no shared "in-app alert" abstraction, so a real-time SSE notification has no ambient/toast surfacing, only a cache update the user must go looking for.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling)

- **SSE reconnection uses a stale, never-refreshed JWT.** `useNotificationStream.ts:29-33`: the access token is read once via `getAuthResponse()` and baked into the `EventSource` URL at mount time; `es.onerror` (`useNotificationStream.ts:51-54`) is an intentional no-op relying on the browser's native auto-reconnect, which simply re-requests the *same* URL. Meanwhile `src/lib/axios.ts:85-135` implements a full 401-refresh-and-retry interceptor for ordinary REST calls. There is no equivalent for the SSE connection: once the embedded token expires, every native reconnect attempt will keep hitting the server with the same expired token and fail, and the stream never recovers without a full page reload.
- **`DUMMY_NOTIFICATIONS` is dead code.** `src/features/notifications/data/dummyNotifications.ts` (26 fixture entries) has zero importers anywhere in `src/` — confirmed by repo-wide grep — left over from pre-API mock data.
- **Push settings UI is fully built but backed by a dead delivery path.** `NotificationSettings.tsx:112-135` renders a working permission banner, and `usePushSubscription.ts` + `public/sw.js:1-24` correctly implement subscribe/unsubscribe and a `push` event handler end-to-end on the client. Per the backend audit, however, the PUSH channel has zero server-side callers, so a user who clicks "Enable" here successfully subscribes their browser but will never actually receive a push notification — the toggle currently does nothing observable, with no UI indication of that fact (the copy says "Get notified even when the app is in the background," which is not true today).

### Technical (performance, accessibility, test coverage)

- **Zero automated test coverage.** No `.test.`/`.spec.` file exists anywhere under `src/features/notifications` or matching `*notification*` in the repo — none of the SSE cache-merge logic, tab filtering, date grouping, or mark-read mutations are covered.
- **Unread badge is a static dot, not a count.** `Header.module.scss:108-121` (`.notificationDot`) renders a fixed 6px dot; the actual `unreadCount` from `useUnreadCount()` (`Header.tsx:34`) is only used in the `aria-label` string, not shown visually, so a user can't tell if there is 1 or 50 unread items without opening the panel.
- **`getAllNotifications` has no pagination.** `notificationApi.ts:59-62` fetches the entire `/notifications` collection with no `page`/`limit` params, and `NotificationPanel` renders the full result client-side. This is harmless today given how few notifications actually fire (per the backend audit), but will not scale once domain modules (leave, attendance, payroll, etc.) start emitting notifications regularly.

## 5. Top 3 Priorities

1. **Fix the broken notification entry point below 801px** (`Header.tsx:84`) — this isn't a polish gap, it's a dead button: a large slice of viewport widths currently have no way to open notifications at all.
2. **Give SSE reconnection a token-refresh path** (`useNotificationStream.ts:29-54`) — without it, any session that outlives the access token's lifetime silently stops receiving real-time notifications until the user reloads the page, undermining the entire "real-time" premise of the feature.
3. **Either wire the push toggle to a real delivery path or remove/label it as unavailable** (`NotificationSettings.tsx:112-135`) — shipping a fully-functional-looking "Enable push notifications" control that silently does nothing (because the backend never calls the PUSH channel) is a trust/UX problem, not just a missing feature.
