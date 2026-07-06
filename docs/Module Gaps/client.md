# Module: Client (webapp)

## 1. Purpose & Current Usage

- **What it does**: CRUD for client organizations (name, POC name/email/phone, address, status, logo) and a detail view that lists the projects belonging to a client. Backed by React Query hooks calling a thin REST wrapper.
  - API layer: `src/features/client/api/client.ts:13-31` — `getClients`, `getClientById`, `createClient`, `updateClient`, `deleteClient`, all hitting `/clients` / `/clients/:id`.
  - Hooks: `src/features/client/hooks/useClients.ts`, `useClient.ts`, `useAddClient.ts`, `useUpdateClient.ts`, `useDeleteClient.ts` — standard React Query wrappers with toast-on-error/success and `['clients']` cache invalidation.
  - Form: `src/features/client/components/AddClientModal/AddClientModal.tsx:24-31` (Zod schema: name, poc_name, poc_email, poc_phone, address, isActive) — used for both create and edit.
  - Logo widget: `src/features/client/components/LogoUpload/LogoUpload.tsx` — file picker with local preview.
  - List page: `src/pages/client/ClientPage.tsx` — table with search/sort/status-filter/pagination, multi-select + Excel export, add/edit/delete modals.
  - Detail page: `src/pages/client/ClientDetailPage.tsx` — client info card + POC sidebar + project stats + a nested project table (add/edit/delete project) scoped to `useParams().id`.
  - Table columns: `src/features/client/columns/clientColumns.tsx`.
  - Types: `src/features/client/types/clientType.ts`.

- **Who uses it / routes**: Registered in `src/routes/adminRoutes.tsx:220-235` as `project/clients` (list) and `project/clients/:id` (detail), both gated only by the module-level `RequireAccess module={ModuleCode.PROJECT_CLIENTS}` — no per-record check. Nested project detail is `project/clients/:clientId/projects/:projectId` (`adminRoutes.tsx:245`). Navigation to the detail page happens via `ClientPage.tsx:121-126` (`navigate(\`/project/clients/${client.id}\`)`).

- **Dead/unused parts**:
  - `ClientPage.tsx:51` declares `const [_logoFile, _setLogoFile] = useState<File | null>(null);` — never read or set anywhere else in the file; pure dead state (underscore-prefixed to silence lint, not actually wired to the modal's own logo state).
  - `AddClientModal.tsx:36` (`_logoFile`/`setLogoFile`) is populated by `LogoUpload`'s `onLogoChange` callback but the value is **never included in `onSubmit`'s payload** (`AddClientModal.tsx:88-96`) and `CreateClientParams`/`UpdateClientParams` (`clientType.ts:48-64`) have no logo field at all — the entire logo upload UI is non-functional decoration; picking a file only updates a local object-URL preview and is discarded on submit.

## 2. Intended / Ideal Usage

- User lands on `/project/clients`, searches/filters/sorts the client roster, and only ever reaches a client's detail/edit surface by clicking through a row action the API has already scoped to their org.
- Creating/editing a client should let the user actually upload and persist a logo if the UI advertises that capability, and the "account manager" concept — if the business wants clients owned by a specific user (referenced in the backend audit as a missing field) — should either be added consistently on both form and entity, or the UI shouldn't imply per-client ownership anywhere.
- Client deletion/edit actions should be restricted server-side by tenant and (per the RBAC gap noted in the backend audit) by role, so the frontend's optimistic multi-tenant trust model isn't the only line of defense.

## 3. Cross-Module Connections

- **Depends on**:
  - `src/features/project` — `ClientDetailPage.tsx:14-18` pulls in `useProjects`, `projectColumns`, `AddProjectModal`, `useDeleteProject` to render/manage the client's projects inline.
  - Shared UI kit (`components/common`: `DataTable`, `ListControls`, `PageHeader`, `NoDataFound`, `WarningModal`, `ExcelExport`, `StatusBadge`, `TableActions`) and `components/ui` (`Input`, `TextArea`).
  - `RequireAccess` / `ModuleCode.PROJECT_CLIENTS` route guard (`adminRoutes.tsx:223,231`) for module-level RBAC.
- **Depended on by**:
  - `src/features/project` reciprocally needs a `clientId` to create/list projects (`AddProjectModal` receives `clientId={id}` in `ClientDetailPage.tsx:277`), so the project module is tightly coupled to client IDs but not to any client-side authorization data.
- **Missing/expected connections**:
  - No wiring to the org's global search feature (per memory notes, employee indexing is wired but nothing here references a documents/search index for clients).
  - No "account manager" / owner concept anywhere in the frontend types or form — consistent with the backend entity gap, so at least the two layers agree (there's no dangling UI field promising a field the backend can't store).

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Logo upload is UI-only with no upload pipeline.** `LogoUpload.tsx` produces a `File`, `AddClientModal.tsx:36,145` captures it in state, but there is no upload API call, no multipart submission, and no field in `CreateClientParams`/`UpdateClientParams` (`clientType.ts:48-64`) to carry it — the feature was scaffolded but never connected to the backend. Users will believe they uploaded a logo when nothing was saved beyond `client.logo_url` returned by the read APIs.
- **Client and project modules share no typed contract for cross-linking beyond a raw string ID.** `ClientDetailPage.tsx:57,277` and the project hooks take `id: string` with no shared `ClientRef`/`ClientSummary` type, so any future rename of the client ID convention would need to be tracked manually through both feature folders.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)

- **Route param makes the backend IDOR trivially exploitable from the UI itself.** `adminRoutes.tsx:229` exposes `project/clients/:id` as a plain URL segment; `ClientDetailPage.tsx:34,56` reads it via `useParams<{ id: string }>()` and passes it straight into `useClient(id)` → `getClientById(id)` (`client.ts:25-27`) → `GET /clients/:id` with no client-side ownership check (there is none to add — the backend has no tenant scoping on `findOne`/`update`/`remove` per the backend audit). Any authenticated user who can see the route (gated only by the coarse `PROJECT_CLIENTS` module permission, not per-record) can hand-edit the ID in the address bar to view, and — via the same-shaped edit/delete calls in `useUpdateClient.ts:21` and `useDeleteClient.ts:15` — edit or delete another org's client. This is the single biggest risk in this feature: the frontend doesn't just fail to add a second line of defense, it actively surfaces the vulnerable ID in a bookmarkable/shareable URL.
- **Column key mismatch silently breaks the Projects count.** `clientColumns.tsx:78` reads `accessorKey: 'projects_count'` but the `Client` type only defines `project_count?: number` (`clientType.ts:14`, singular, no "s"). Whichever name the backend actually returns, one of the two spellings is wrong, so the "Projects" column in the list table will render `0` for every client unless the backend happens to send both keys.
- **Dead state in `ClientPage.tsx:51`.** `_logoFile`/`_setLogoFile` are declared and never used elsewhere in the component — leftover scaffolding that should be deleted.
- **No inline client-side validation feedback for phone format** — `poc_phone` (`AddClientModal.tsx:28`) only requires non-empty (`z.string().min(1, ...)`), so malformed phone numbers pass validation; combined with no backend contract shown here, garbage values can be persisted.

### Technical (performance, security, accessibility, test coverage)

- **Zero test coverage.** No `*.test.*`/`*.spec.*` files exist anywhere under `src/features/client` or `src/pages/client` — none of the CRUD hooks, form validation, or the detail-page project stats math (`ClientDetailPage.tsx:188-213`, which recomputes counts by filtering the *current page* of `projects` rather than using server-aggregated totals) are covered.
- **Project stats are computed from the paginated page, not the full dataset.** `ClientDetailPage.tsx:190-213` filters `projects` (the current page of results from `useProjects`) by status to show Active/Completed/On-Hold counts, so once a client has more projects than one page size, these stat tiles will under-report versus the `Total` tile which correctly uses `projectsResponse?.data?.meta?.total` (`ClientDetailPage.tsx:60`).
- **Accessibility**: the emoji icons used as sole visual indicators for phone/email/address (`ClientDetailPage.tsx:136,140,173`) have no `aria-label`/text alternative beyond a `title` attribute on the phone/email rows (address icon has none at all), which is weak for screen readers.

## 5. Top 3 Priorities

1. **Fix the IDOR-exposing route/UI flow.** Even though the root cause is backend tenant-scoping, the frontend concretely weaponizes it by putting the client's raw ID in a shareable, editable URL (`adminRoutes.tsx:229`, `ClientDetailPage.tsx:34,56`) with only a coarse module permission gating access — fixing the backend without revisiting whether any client-facing UUID should be route-addressable at all leaves the door wide open.
2. **Finish or remove the logo upload feature.** Right now `LogoUpload` (`LogoUpload.tsx`) and its wiring in `AddClientModal.tsx:36,145` silently discard the selected file — either implement the upload call and add the field to `CreateClientParams`/`UpdateClientParams`, or remove the control so users aren't misled.
3. **Fix the `projects_count`/`project_count` field-name mismatch** in `clientColumns.tsx:78` vs `clientType.ts:14` so the Projects column on the list page actually reflects real data.
