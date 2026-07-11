# Module: Users (webapp)

## 1. Purpose & Current Usage

`src/features/users/` is a small, four-file-API feature (`api/user.ts`) that does exactly two things: (a) maps/unmaps an **existing** user account to a department and/or designation, and (b) looks up a single user's details by ID. It is **not** a roles/permissions/user-account-management feature — there is no create/invite, no password/status management, and no role or access-grant UI anywhere in this folder.

- `api/user.ts:11-25` — `getUsers()` → `GET /users/list`, `mapUsers()` → `PATCH /users/map`, `unmapUsers()` → `PATCH /users/unmap`, `getUserById()` → `GET /users/:id`.
- `hooks/useUsersList.ts` — React Query wrapper around `getUsers`, key `['usersList']`.
- `hooks/useMapUsers.ts:16-26` / `hooks/useUnmapUsers.ts:16-26` — bulk map/unmap by fanning a `Promise.all` of *per-user* PATCH calls (the backend DTOs `MapDepartmentDesignationDto`/`UnmapDepartmentDesignationDto`, confirmed in `brello_server/src/modules/user/dto/*.ts`, only accept one `userId` each — there is no batch endpoint).
- `hooks/useGetUserById.ts` — single-user lookup, `queryKey: ['user', id]`.
- `components/AddEmployeeModal/AddEmployeeModal.tsx` — a right-side drawer with a searchable `DataTable` of users (row-selectable), used to bulk-map selected users into a department or designation.

**Consumers (exhaustive — confirmed via repo-wide grep):**
- `src/components/layout/Header/Header.tsx:21,40` — calls `useGetUserById(authUser?.id)` to render the *logged-in user's own* name/designation/avatar in the top bar. This is the only consumer of `getUserById`.
- `src/pages/department/DepartmentDetailPage.tsx:8-10,37-38,139-143` and `src/pages/designation/DesignationDetailPage.tsx:8-10,36-37,138-142` — both use `useUsersList`, `useUnmapUsers`, and `AddEmployeeModal` to list/add/remove members of a department or designation. Routes: `organisation/departments/:id` and `organisation/designations/:id` (`src/routes/adminRoutes.tsx:68-91`, gated by `RequireAccess module={ModuleCode.ORG_DEPARTMENTS/ORG_DESIGNATIONS}`).
- Both detail pages actually render rows with `employeeColumns` imported from **`features/department/columns/employeeColumns`**, not from `features/users` — i.e. `users/` supplies data-fetching/mutation only, another feature owns the table presentation.

**`users/` vs `employee/` split (clarification):** `features/employee/` owns the entire HR lifecycle — onboarding wizard (`AddEmployeeWizard`, including `SystemAccessStep.tsx` which calls `updateSystemAccess`), profile cards, documents, education/experience, payroll, offboarding. `features/users/` owns none of that; it is a thin org-structure directory used to (1) attach/detach an already-existing account to org-structure entities and (2) resolve "who is currently logged in" for the header. There is zero overlap in API calls or types between the two folders.

**Dead/underused parts:** `useGetUserById` has exactly one call site (`Header.tsx`, always with the logged-in user's own ID) — there is no "view another user's profile" page built on it, so the general-purpose `GET /users/:id` lookup capability this hook exposes is effectively unused beyond self-lookup.

## 2. Intended / Ideal Usage

A correct version of this feature should: reliably reflect per-user success/failure when bulk-mapping/unmapping (not one aggregate toast for N independent backend calls), only offer active/eligible accounts in the "add to department/designation" picker, and keep its naming and scope unambiguous relative to `employee/` (this is account-to-org-structure mapping, not employee creation).

## 3. Cross-Module Connections

**Depends on:**
- `departments`/`designations` — the `departmentId`/`designationId` params threaded through `mapUsers`/`unmapUsers`, and (for table rendering) `features/department/columns/employeeColumns` is imported directly by the pages that use this feature.
- `auth` — `getAuthUser()` (`src/utils/authUtils.ts`) supplies the ID that `Header.tsx` passes into `useGetUserById`.
- Backend `UserController`/`UserService` (`brello_server/src/modules/user/controllers/user.controller.ts:62-99`, `services/user.service.ts:233-307`) — thin CRUD/mapping only, confirmed to have no role/permission logic at all.

**Depended on by:** `Header.tsx` (global app chrome, every page), `DepartmentDetailPage.tsx`, `DesignationDetailPage.tsx`.

**Missing/expected connections — role assignment question:** `users/` contains **no** "manage user roles/access" UI, so it cannot give a false confirmation for the backend `updateSystemAccess` bug directly — that risk lives entirely in `features/employee` (`SystemAccessStep.tsx` → `useEmployeeWizard.ts:54-55` → `updateSystemAccess` → `plan_id`, already documented in `brello_server/docs/Module Gaps/user.md`). However, this reveals a structural gap the split itself creates: the codebase has **two independent, disconnected paths** that both claim to manage "who has access to what" — (1) `features/access/users/` (`useAccessUsers.ts`, backed by `/user-role-maps`, the real `user_role_map` mechanism, per `docs/Module Gaps/access.md`) and (2) `employee`'s onboarding-time `SystemAccessStep` (backed by the broken `updateSystemAccess`). Neither `features/users/` nor either of the other two links to/warns about the other, so an admin who fixes a user's role via `Access > Users` has no way to know the same user's onboarding-time "system access" toggle silently did nothing, and vice versa — `features/users/` sits structurally adjacent to both and would be a reasonable place for a future consolidated "user identity + access" view, but today does not attempt it.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **`AddEmployeeModal` is misnamed and scope-confusing relative to `employee/`'s actual employee-creation flow.** `src/features/users/components/AddEmployeeModal/AddEmployeeModal.tsx` never creates a user — it only calls `useMapUsers` (map an *existing* account to a department/designation) — while the real "add employee" flow is `features/employee/components/AddEmployeeWizard/AddEmployeeWizard.tsx`. Two differently-scoped components sharing the name "AddEmployee" across two features is confusing for anyone reading call sites cold (e.g. `DepartmentDetailPage.tsx:139-143` renders "Add employee" but is really "map existing user to this department").
- **Cross-feature coupling on table presentation.** `DepartmentDetailPage.tsx:6` and `DesignationDetailPage.tsx:6` render `users/`'s data through `employeeColumns` imported from `features/department/columns/employeeColumns`, not anything defined in `features/users/` — the feature has no owned presentation layer, only data hooks, so its "boundary" is really just an API/hooks facade consumed piecemeal by three unrelated pages.
- **`useGetUserById` is a general-purpose lookup hook with a single, narrow caller.** (`Header.tsx:40`) — no dedicated "user profile" page exists in this feature to justify the generality of `GET /users/:id`, so the abstraction is bigger than its one real use case.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)

- **Bulk map/unmap silently loses partial-success state on any single failure.** `useMapUsers.ts:16-26` and `useUnmapUsers.ts:16-26` fan out one backend call per selected user via `Promise.all`. The backend only supports single-user map/unmap (`MapDepartmentDesignationDto`/`UnmapDepartmentDesignationDto` take one `userId`, confirmed in `brello_server/src/modules/user/dto/*.ts`). If any one of N calls rejects, `Promise.all` rejects immediately, the `catch` shows one generic toast (`'Failed to map users'`/`'Failed to unmap users'`), and because the `mutationFn` threw, the `onSuccess` handler that invalidates `['usersList']` (`useMapUsers.ts:34-40`) never runs. Users already successfully mapped/unmapped by earlier-resolving promises are not reflected in the refreshed list, and the admin has no way to tell which of the N users actually succeeded. This matters because bulk actions are the feature's main use case (via `AddEmployeeModal`'s multi-row-selection and the department/designation "remove selected" flow).
- **Terminated/inactive users are selectable in the "Add Employees" picker.** `AddEmployeeModal.tsx:94-107` (`filteredUsers`) filters only by the search string — there is no `status` check — so users with `status !== 'ACTIVE'` (visibly rendered in the Status column, `AddEmployeeModal.tsx:51-69`) can still be row-selected and mapped into a department/designation.
- **Inconsistent pagination reset.** Initial state is `pageSize: 10` (`AddEmployeeModal.tsx:80`), but `handleClose` resets to `pageSize: 5` (`AddEmployeeModal.tsx:90`) — a one-line inconsistency that changes page size between the modal's first open and every subsequent reopen.
- **Client-side "already mapped" pre-check can act on stale cache data.** `AddEmployeeModal.tsx:129-136` blocks submission per-user using the in-memory `usersResponse` from `useUsersList()` without refetching immediately before submit; if another admin mapped the same user concurrently, the frontend check can pass on stale data while the backend (`mapDepartmentAndDesignation`, `user.service.ts:258-281`) silently no-ops for a user that already has a `department_id`/`designation_id` set — so a "successful" map can leave a user's designation/department unchanged with no error surfaced.

### Technical (performance, security, accessibility, test coverage)

- **`password_hash` is exposed to every session through this feature's own hook.** The backend audit (`brello_server/docs/Module Gaps/user.md`, §4 Coding) found `GET /users/:id` returns the raw `User` entity including `password_hash` (no DTO/serializer wired in). `useGetUserById` (`features/users/hooks/useGetUserById.ts`) calls this exact endpoint from `Header.tsx` on **every authenticated page load** (to render the profile widget) — so the hash is sent over the wire in every user's browser Network tab today, independent of any special privilege, even though the frontend's own `UserDetailsResponse` type (`types/userType.ts:75-92`) doesn't declare the field and no UI renders it.
- **Third-party avatar leak.** `AddEmployeeModal.tsx:32` builds `avatarUrl` via `https://ui-avatars.com/api/?name=<user full name>...` for every row rendered in the picker, sending every listed employee's real name to an external third-party service purely to generate a placeholder avatar image, with no local/offline fallback.
- **Hardcoded, unsigned S3 URL construction duplicated in a layout component.** `Header.tsx:51-53` builds `https://${photo.bucket}.s3.us-east-1.amazonaws.com/${photo.object_key}` directly, hardcoding the AWS region and assuming the object is publicly readable/unsigned — this URL-building logic belongs in a shared photo/document helper, not inlined in the global header.
- **Zero automated test coverage.** No `.spec.ts`/`.test.ts` files exist anywhere under `src/features/users/` (confirmed via directory search) — none of the bulk map/unmap fan-out logic, the status-filter gap, or the modal's per-user validation branches above have any regression protection.
- **No loading/error state surfaced by consuming pages.** `DepartmentDetailPage.tsx:37` and `DesignationDetailPage.tsx:36` destructure only `data` from `useUsersList()`, ignoring `isLoading`/`isError` — the member table silently renders zero rows during the fetch or on failure (a toast fires from inside the hook, but the table itself gives no loading/empty-state feedback).

## 5. Top 3 Priorities

1. **Fix the bulk map/unmap fan-out so partial failures are surfaced per-user and successful mappings are always reflected** (invalidate `['usersList']` regardless of overall `Promise.all` outcome, and report which specific users failed) — today a single failed request in a batch hides all progress from the admin and can desync the UI from the database.
2. **Exclude non-ACTIVE users from the "Add Employees" picker** (`AddEmployeeModal.tsx:94-107`) — mapping inactive/terminated accounts into live departments/designations is a straightforward data-integrity bug with a one-line fix (add a status filter alongside the existing search filter).
3. **Stop `GET /users/:id` from leaking `password_hash` through this feature's own `useGetUserById` call in the global header** — this is the single highest-severity item here because, unlike the backend-only audit finding, it is concretely exercised on every authenticated page load by this feature, making the secret visible in any browser's Network tab today.
