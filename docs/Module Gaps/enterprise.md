# Module: Enterprise (webapp)

## 1. Purpose & Current Usage

- `src/features/enterprise/` is **entirely empty scaffolding**: it contains only three sub-directories — `api/`, `components/Layout/`, `hooks/` — and every one of them contains zero files (verified via `find` recursive listing). There is no component, hook, type, or API call anywhere under this path.
- `src/pages/enterprise/` mirrors the same pattern: `access/`, `billing/`, `dashboard/`, `organizations/` sub-folders all exist but are empty. None of these paths are imported by any route file (`src/routes/index.tsx`, `employeeRoutes.tsx`, `adminRoutes.tsx`, `platformAdminRoutes.tsx`) — confirmed with `grep -rln "features/enterprise|pages/enterprise" ./src`, which returns no hits.
- The only real, working "enterprise" domain code in the frontend lives in `src/features/platform/enterprises/` (a **platform-admin CRUD feature**, distinct from the empty `src/features/enterprise/`):
  - `src/features/platform/enterprises/api.ts` — `getEnterprises`, `getEnterprise`, `createEnterprise`, `updateEnterprise`, `deleteEnterprise` against `${BRELLO_BASE_API}/enterprises`.
  - `src/features/platform/enterprises/hooks.ts` — React Query wrappers (`useEnterprisesList`, `useCreateEnterprise`, `useUpdateEnterprise`, `useDeleteEnterprise`).
  - `src/features/platform/enterprises/EnterpriseFormModal.tsx` — create/edit form (name, domain, logo, favicon).
  - `src/features/platform/enterprises/types.ts` — `Enterprise`, `EnterpriseApp`, request/response types.
  - Consumed by `src/pages/platform/PlatformEnterprisesPage.tsx`, routed at `src/routes/platformAdminRoutes.tsx:25` (`{ path: 'enterprises', element: <PlatformEnterprisesPage /> }`), and linked from `src/features/sidebar/Sidebar.tsx:53-55` ("Enterprises" nav item, `/platform/enterprises`).
  - `org.enterprise?.name` is also surfaced read-only in `src/pages/platform/PlatformOrganizationDetailPage.tsx:170-171,248`.
- Dead code: `getEnterprise(id)` (singular fetch, `api.ts:15-16`) is exported but never imported/called anywhere in the codebase — no `enterprises/:id` route exists in `platformAdminRoutes.tsx`, and the list page edits/deletes using in-memory row objects instead.

## 2. Intended / Ideal Usage

- Given the naming (`dashboard`, `billing`, `access`, `organizations` sub-pages), `src/features/enterprise/` + `src/pages/enterprise/` appear to have been scaffolded for an **end-user-facing enterprise workspace** (an enterprise-level view spanning multiple organizations: billing, cross-org access control, an enterprise dashboard) — conceptually separate from the platform-admin CRUD that only lets platform staff create/edit/delete enterprise records. None of that end-user-facing surface has been built.
- Ideally the platform-admin CRUD in `features/platform/enterprises/` would also be able to manage the `apps` assigned to an enterprise (currently display-only, see gap below), and would expose an enterprise detail/edit route instead of only a modal-driven flow.

## 3. Cross-Module Connections

**Depends on:**
- `src/lib/axios` (`apiClient`), `src/utils/envVars`, `src/features/ToastFeature/ShowToast`, `@tanstack/react-query`, `react-hook-form`, shared UI (`DataTable`, `Dialog`, `Input`, `TableActions`, etc.).

**Depends on this (real feature only — `features/platform/enterprises/`):**
- `src/pages/platform/PlatformEnterprisesPage.tsx` (list/CRUD UI).
- `src/features/sidebar/Sidebar.tsx:53-55` (nav link).
- `src/pages/platform/PlatformOrganizationDetailPage.tsx:170-171,248` (read-only `org.enterprise?.name` display — no link back to the enterprise record).
- Indirectly, `getEnterpriseId()` (`src/utils/authUtils.ts:30-32`) is used by `src/features/project/components/AddProjectModal/Tabs/ContractTab.tsx:48` and `src/features/employee/components/AddEmployeeWizard/steps/DocumentsStep.tsx:55` — but this reads the *current authenticated user's own* `enterprise_id` from their session, not a user-editable value.
- `src/features/auth/components/Register/RegisterForm.tsx:39,59` and `src/features/platform/plans/api.ts:8-9` reference `enterprise_id`/`enterpriseId` but only as pass-through data from plan selection, not from this feature's CRUD.

**Missing / expected connections:**
- No link/navigation from `PlatformOrganizationDetailPage`'s enterprise display (`org.enterprise?.name`) to the enterprise's own edit page.
- No detail route (`enterprises/:id`) — the dead `getEnterprise(id)` function suggests one was planned but never wired up.
- `src/features/enterprise/` and `src/pages/enterprise/` are not connected to anything at all.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)
- `src/features/enterprise/` (api/components/hooks) and `src/pages/enterprise/` (access/billing/dashboard/organizations) are fully empty directory scaffolds with zero files, unreferenced by any route — dead scaffolding left in the tree from initial project setup. This matters because it misleads anyone searching the codebase into thinking an "enterprise" end-user feature exists when it doesn't; it should either be built out or removed.
- `Enterprise.apps: EnterpriseApp[]` is fetched and rendered (`PlatformEnterprisesPage.tsx` `AppChips` component) but `CreateEnterpriseRequest`/`UpdateEnterpriseRequest` (`types.ts:24-32`) have no `apps` field, so there is no UI path to assign or remove apps from an enterprise — the only CRUD surface for this feature is read-only for a field it otherwise treats as core data.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)
- `getEnterprise(id)` (`src/features/platform/enterprises/api.ts:15-16`) is exported but never imported anywhere (`grep -rn "getEnterprise\b"` returns only its own definition) — dead code that should be removed or wired to a detail route.
- `EnterpriseFormModal.tsx:140-152` registers `logo` and `favicon` fields with **no validation rules** (`register('logo')`, `register('favicon')`), while the adjacent `domain` field has a regex pattern (`EnterpriseFormModal.tsx:113-119`) — inconsistent validation lets malformed/non-URL strings for logo and favicon reach the backend unchecked.
- `EnterpriseFormModal.tsx:136` shows static help text "Domain must be a registered domain — DNS validation is performed on save," but no code in the modal surfaces or waits on the result of that check beyond a generic error toast from `useCreateEnterprise`/`useUpdateEnterprise` (`hooks.ts:20-22,34-36`) — the UI promises validation feedback it doesn't specifically deliver.

### Technical (performance, security, accessibility, test coverage)
- **Cross-org enumeration question (per backend audit of `GET /organizations/enterprise/:enterpriseId`):** no frontend code constructs or calls this specific path. The enterprise API client here targets a different route (`/enterprises/:id`, `api.ts:9`), and the one function that would call it by arbitrary id (`getEnterprise`) is dead/unused. Every place an `enterpriseId` is used at runtime either comes from the currently authenticated user's own session (`getEnterpriseId()` in `authUtils.ts:30-32`, consumed in `ContractTab.tsx:48` and `DocumentsStep.tsx:55`) or from in-memory row data in `PlatformEnterprisesPage.tsx` (no `enterprises/:id` route exists in `platformAdminRoutes.tsx`, so an id is never round-tripped through a URL param or editable form field). **Conclusion: the backend enumeration hole is not reachable through any current UI surface** — it would require a direct API call (curl/Postman) outside the app, not exploitable via the webapp itself today.
- No test files exist for `src/features/platform/enterprises/*` (`find` for `*enterprise*test*`/`*enterprise*spec*` returns nothing) — zero automated coverage for the only functioning enterprise feature in the frontend, including its create/update/delete mutations and list rendering.

## 5. Top 3 Priorities

1. **Resolve the empty `src/features/enterprise/` and `src/pages/enterprise/` scaffolding** — either build the intended end-user enterprise workspace (dashboard/billing/access/organizations) or delete the dead directories; leaving them empty and unreferenced actively misleads future development.
2. **Add test coverage for `src/features/platform/enterprises/*`** — this is the only real enterprise code shipping today (full CRUD against a platform-admin-only, high-privilege resource) and has zero tests.
3. **Close the validation/dead-code gaps in `EnterpriseFormModal.tsx`/`api.ts`** — add real validation to `logo`/`favicon` fields, remove or wire up the unused `getEnterprise(id)`, and either implement or remove the "DNS validation on save" promise so the UI doesn't overstate what it checks.
