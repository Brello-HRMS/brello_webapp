# Module: Access (RBAC gating - webapp)

## 1. Purpose & Current Usage

**Important scope note:** `src/features/access/` is *not* the gating layer itself — it is the RBAC **admin-management** feature (the UI admins use to manage roles, assign roles to users, and edit role→permission mappings). The actual gating primitives (`PermissionGate`, `RequireAccess`) and the permission-resolution hook (`useModuleAccess`) live outside this folder, in `src/components/common/` and `src/hooks/`. Both halves are documented here since they form one system.

- **`src/features/access/roles/`** — `useRoles.ts` (CRUD for roles via `/roles`), `RoleDrawer.tsx`, `rolesColumns.tsx`. Backs `src/pages/access/RolesPage.tsx`.
- **`src/features/access/users/`** — `useAccessUsers.ts` (manages `user_role_map` records via `/user-role-maps`), `AddUserDialog.tsx`, `accessUsersColumns.tsx`. Backs `src/pages/access/UsersPage.tsx`.
- **`src/features/access/permissions/hooks/usePermissions.ts`** — `useRolePermissionsQuery` / `useUpdateRolePermissionsMutation`, editing a role's module/action permission matrix via `/module-access/role/:roleId/permissions-list`. Backs `src/pages/access/PermissionsPage.tsx`.
- **`src/hooks/useModuleAccess.ts`** — the actual permission-resolution hook. Fetches `GET /menu/permissions` once (shared React Query key `PERMISSIONS_QUERY_KEY = ['permissions']`, `staleTime: 5 min`) and derives a per-module `AccessMap` (`hasViewAccess`, `hasCreateAccess`, `hasEditAccess`, `hasDeleteAccess`, `hasApproveAccess`, `hasExportAccess`, `hasActivateAccess`, `hasCloneAccess`) from `ModuleCode` (`src/enum/modules.ts`).
- **`src/components/common/PermissionGate/PermissionGate.tsx`** — element-level gate; hides/shows children based on one `(module, action)` check.
- **`src/components/common/RequireAccess/RequireAccess.tsx`** — route-level gate; renders `ForbiddenPage` (403) if `hasViewAccess` is false.

**Consumers (spot-checked, not exhaustive):**
- `RequireAccess` wraps **36** routes in `src/routes/adminRoutes.tsx` (departments, designations, policies, payroll, letter-management, leave, employee directory, attendance, clients, projects, reimbursement, announcements, access/roles/users/permissions, audit-logs, support, timesheet).
- `PermissionGate` is used in only **8** places for element-level (mostly "Create" button) gating: `src/pages/access/UsersPage.tsx:110`, `src/pages/access/RolesPage.tsx:94`, `src/pages/department/DepartmentPage.tsx:258`, and four letter-management pages (`CategoriesPage.tsx:114`, `TemplatesPage.tsx:162`, `IssuedLettersPage.tsx:169`, `SignatoriesPage.tsx:124`).
- `useModuleAccess` is also called **directly** (bypassing `PermissionGate`) in ~8 pages to conditionally wire up edit/delete callbacks, e.g. `src/pages/department/DepartmentPage.tsx:63-64` (`onEditClick={hasEditAccess ? ... : undefined}`, `onDelete={hasDeleteAccess ? ... : undefined}` at lines 172/174/189/190).

**Dead/unused parts:** None found — every file in `roles/`, `users/`, and `permissions/` is imported by its corresponding page (`RolesPage.tsx`, `UsersPage.tsx`, `PermissionsPage.tsx`).

## 2. Intended / Ideal Usage

Correct usage of this layer is purely a UX concern: hide nav items, hide buttons the user can't act on, and redirect away from pages they can't view — nothing more. It must never be the only enforcement point for an action, because any authenticated user can call the backend API directly (curl/Postman/devtools) bypassing React entirely.

**This is not a hypothetical today.** A companion backend audit this session found ~74 controllers checked, with a large share of core modules — clients, users, projects, departments, documents, reimbursements, timesheets, base attendance — enforcing **zero** server-side `@RequirePermission` checks (only `JwtAuthGuard`, i.e. "logged in" not "authorized"). For those exact modules, this frontend `useModuleAccess`/`PermissionGate`/`RequireAccess` layer is currently the **only** access control that exists anywhere in the system. The codebase does not appear to treat this as a known, temporary gap — there are no `// TODO: backend enforcement pending` markers, no compensating checks, and (see §4) the frontend itself doesn't even consistently gate the UI for these modules, meaning the false sense of security is incomplete even on the client side.

## 3. Cross-Module Connections

**Depends on:**
- `GET /menu/permissions` (`src/api/moduleAccess.ts`) — the single source of truth for the logged-in user's effective permissions, keyed only by React Query's `['permissions']` key (no user-id scoping in the key itself).
- Auth/cookie layer (`src/utils/cookieUtils.ts`, `auth_response` cookie) for `isAuthenticated()`/`isAdminApp()`/`isPlatformAdmin()` — a **separate, parallel** mechanism from module RBAC (platform-admin routes in `src/routes/platformAdminRoutes.tsx` are gated only by a boolean `is_platform_admin` flag via `platformAdminLoader` in `src/routes/index.tsx:47-50`, never via `RequireAccess`/`ModuleCode`).
- `ModuleCode`/`ActionCode` enums (`src/enum/modules.ts`) as the shared vocabulary between frontend gating and backend permission rows.

**Depends on this (representative sample):** `src/routes/adminRoutes.tsx` (route gating for nearly every admin-app page), `src/features/sidebar/hooks/useSidebarMenu.ts` (separate `/menu` fetch driving which nav items render, invalidated explicitly on permission save — see `usePermissions.ts:46-48`), `src/pages/department/DepartmentPage.tsx`, `src/pages/letter-management/*`, `src/pages/access/*`.

**Missing/expected connections:**
- No connection back into the axios layer: `src/lib/axios.ts:85-92` only intercepts `401`, there's no `403` handling to reconcile a stale frontend "you can do this" state with a backend rejection.
- No connection to logout/login lifecycle (see §4 Technical) to invalidate the permissions cache across identity changes.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)
- The gating primitives (`PermissionGate`, `RequireAccess`, `useModuleAccess`) live entirely outside `src/features/access/`, while `src/features/access/` itself only contains RBAC *admin-management* CRUD. There is no shared module boundary tying "the thing that manages permissions" to "the thing that enforces permissions" — someone auditing `features/access/` in isolation (as this task's premise assumed) would miss the actual enforcement code entirely. This matters because it makes the security-critical primitives harder to discover and review as a unit.
- Two parallel, non-integrated access mechanisms coexist: module/action RBAC (`ModuleCode`) and a boolean `is_platform_admin` flag (`src/routes/index.tsx:29-36`, `platformAdminRoutes.tsx`) with no shared abstraction — inconsistent mental model for future contributors adding new gated surfaces.

### Coding (bugs, dead code, inconsistent gating patterns)
- **Billing routes are completely ungated at the route level** despite `ModuleCode.BILLING` existing in the enum: `src/routes/adminRoutes.tsx:332-334` (`billing/plan`, `billing/invoice`, `billing/payments`) render with no `RequireAccess` wrapper at all, unlike every neighboring route block. Any authenticated user can navigate directly to these URLs regardless of role.
- **Action-button gating is inconsistent to the point of being absent for the highest-risk modules.** `src/pages/client/ClientPage.tsx`, `src/pages/project/ProjectPage.tsx`, `src/pages/project/timesheet/TimesheetPage.tsx`, and `src/pages/reimbursement/ReimbursementPage.tsx` contain zero references to `useModuleAccess` or `PermissionGate` — their Add/Edit/Delete buttons (e.g. `ClientPage.tsx:137,164,181,215,216`) render unconditionally for anyone with view access, in contrast to the correct pattern used in `DepartmentPage.tsx:63-64,172-190`. These are exactly the modules the backend audit flagged as having zero server-side RBAC (clients, projects, timesheets, reimbursements) — so today there is no permission check on these actions anywhere in the stack, front or back.
- **Type/runtime mismatch in the permissions editor:** `src/pages/access/PermissionsPage.tsx:53` reads `selectedRole?.is_system_role`, but the `Role` interface in `src/features/access/roles/types.ts` never declares `is_system_role` (it exists in the *platform* `Role` type at `src/features/platform/roles/types.ts:15` instead). This silently type-checks only because `src/api/roles.ts` calls `apiClient.get`/`post` without a generic type parameter, so the whole `roles` array resolves to `any` — meaning TypeScript provides no real safety net over this RBAC data path, and a backend field rename would fail silently at runtime instead of at compile time.

### Technical (SECURITY — staleness/caching, performance, test coverage)
- **Stale/cross-user permission cache risk.** `useModuleAccess` caches under one static key `['permissions']` with `staleTime: 5 * 60 * 1000` (`src/hooks/useModuleAccess.ts:14-24`), and the global `QueryClient` (`src/lib/react-query.ts:3-10`) sets `refetchOnWindowFocus: false`. Logout (`src/features/auth/api/useLogout.ts:11-26`) only removes the `auth_response` cookie and calls `navigate('/auth/login')` — it never calls `queryClient.clear()` or removes the `['permissions']` cache entry, and login (`OtpForm.tsx`) is also an in-SPA `navigate()`, not a full page reload. Net effect: if a second user logs into the same browser tab/session within 5 minutes of the first user's session, the app can serve the first user's cached permission map to the second user until the cache naturally expires or is invalidated.
- After an admin edits a role's permissions via `PermissionsPage`, `useUpdateRolePermissionsMutation` (`src/features/access/permissions/hooks/usePermissions.ts:41-44`) explicitly invalidates the `['permissions']` cache with `refetchType: 'none'` — by design (documented in-code) this means any other already-open tab/session for an affected user will **not** refetch until its next navigation/mount, so a permission downgrade does not take effect immediately for users with the page already open. This is a reasonable trade-off for a pure UX layer, but it reinforces why this layer cannot double as a security boundary.
- No automated tests found for `PermissionGate`, `RequireAccess`, or `useModuleAccess` (no `*.test.ts(x)` alongside these files) — regressions in gating logic (e.g. the ungated billing routes above) would not be caught by CI.

## 5. Top 3 Priorities

1. **Get server-side RBAC in place for clients/projects/timesheets/reimbursements/documents/departments/users (per the backend audit) — this frontend layer is provably not a safety net for them today.** The action buttons for exactly these modules are also frontend-ungated (`ClientPage.tsx`, `ProjectPage.tsx`, `TimesheetPage.tsx`, `ReimbursementPage.tsx`), so currently *no* layer of the stack checks permissions for create/edit/delete on this data.
2. **Gate the billing routes** (`adminRoutes.tsx:332-334`) with `RequireAccess module={ModuleCode.BILLING}` — this is a one-line-per-route fix for an outright omission next to otherwise-consistent code.
3. **Clear the `['permissions']` (and other user-scoped) React Query cache on logout**, e.g. `queryClient.clear()` in `useLogout.ts`, to eliminate the cross-user stale-permission window on shared/kiosk browser sessions.
