# Module: Project (webapp)

## 1. Purpose & Current Usage

The Project feature covers project CRUD under a client, team assignment, contract file attachment, an org-wide project list, and a separate Timesheet sub-module that reads/writes time entries against assigned projects.

**API layer** — `src/features/project/api/projectApi.ts`
- `getProjects(clientId, params)` → `GET /clients/:clientId/projects` (client-scoped list, the endpoint that maps to the backend's buggy `findAllByClient`).
- `getAllProjects(params)` → `GET /projects` (org-wide list, presumably backend `findAll`).
- `getProject`, `createProject`, `updateProject`, `deleteProject`, `addTeamMembers`, `getProjectTeam`, `uploadProjectContract`, `getProjectContracts`, `deleteProjectContract`.

**Hooks** — `src/features/project/hooks/*.ts`: `useProjects` (client-scoped list), `useAllProjects` (org-wide list), `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useAddProjectTeam` (unused, see Gaps), `useProjectTeam`, `useProjectContracts`/`useDeleteProjectContract`, plus timesheet hooks (`useTimesheetDashboard`, `useTimesheetProjects`, `useTimesheetCalendar`, `useCreateTimesheet`, `useUpdateTimesheet`, `useDeleteTimesheet`).

**Pages/routes** — `src/routes/adminRoutes.tsx:220-249`
- `project/clients` → `ClientPage` (client feature, not audited here).
- `project/clients/:id` → `src/pages/client/ClientDetailPage.tsx` — client-scoped project table, add/edit/delete project.
- `project/projects` → `src/pages/project/ProjectPage.tsx` — org-wide project table with Excel export.
- `project/clients/:clientId/projects/:projectId` → `src/pages/project/ProjectDetailPage.tsx:10-31` — renders `ProjectDetailHeader`, `ProjectTeamTable`, `ProjectContractSummary`.
- `project/timesheet` → `src/pages/project/timesheet/TimesheetPage.tsx` — calendar + table view of logged hours per assigned project.

**Dead/unused code**
- `src/features/project/components/ProjectDetail/ProjectLeadBar.tsx` — never imported anywhere (not in `ProjectDetailPage.tsx`); also references `project.lead_id`, a field that does not exist on the `Project` type.
- `src/features/project/components/ProjectDetail/ProjectOverviewCard.tsx` — never imported anywhere.
- `src/pages/project/timesheet/components/ProjectSummaryCard.tsx` — never imported anywhere (only `ProjectHoursTable` is used in `TimesheetPage.tsx:353`).
- `src/features/project/hooks/useAddProjectTeam.ts` — exported but never imported/used; team assignment is instead inlined via `addTeamMembers` calls inside `useCreateProject.ts:19-25` and `useUpdateProject.ts:38-44`.

## 2. Intended / Ideal Usage

A user opens a client's detail page, adds a project (basic info, team with one designated lead, optional contract uploads), views it from either the client-scoped table or the org-wide Project Management page, drills into `ProjectDetailPage` to see team/contracts, and edits/removes team members or deletes the project when needed — all status filters and displayed status badges reflecting the same lifecycle field (`project_status`), and destructive actions clearly communicating that deletion is permanent.

## 3. Cross-Module Connections

**Depends on:**
- Client feature (`src/pages/client/ClientDetailPage.tsx`) — hosts the "Add project" entry point and passes `clientId` into `AddProjectModal`/`useCreateProject`.
- Employee/document infrastructure — `useEmployeesDropdown` (`TeamTab.tsx:7`) for team member selection, `useUploadDocumentUrl`/`useUploadDocumentData`/`useDeleteDocument` (`ContractTab.tsx:14-17`) for contract files.

**Depends on this:**
- Timesheet sub-module (`src/pages/project/timesheet/*`) — `useTimesheetProjects` populates the project filter/color legend; timesheet entries are keyed by `project_id`.
- `ClientDetailPage.tsx` project-count stat cards (`Active`/`Completed`/`On Hold`), which read `project.project_status`.

**Missing/expected connections (this audit's specific questions):**
- **Yes — the broken `findAllByClient` path is reachable from the UI.** `ClientDetailPage.tsx:24-30` defines a status filter (`STATUS_OPTIONS`) and `ClientDetailPage.tsx:47-54` builds `queryParams` with `status: selectedStatus` whenever the user picks anything but "All Status", then calls `useProjects(id, queryParams)` (`ClientDetailPage.tsx:57`) → `getProjects(clientId, params)` (`projectApi.ts:15-20`) → `GET /clients/:clientId/projects?status=...`. This is exactly the client-scoped listing endpoint whose backend `findAllByClient` filters on the nonexistent `status` column instead of `project_status`. Any user who filters projects by status from a client's detail page will trigger the SQL error. Confirming the mismatch: `GetProjectsParams` (`projectType.ts:178-186`) only declares a `status` field (no `project_status`), matching what `ClientDetailPage.tsx` sends — while the org-wide `ProjectPage.tsx:56` instead sends `project_status` (a key not even declared on `GetProjectsParams`), because it hits the different, presumably-correct `findAll` endpoint. The two call sites use two different, inconsistent query-param names for the same concept.
- **Delete does warn about permanence, but for the wrong architectural reason.** The only delete entry point in the UI is `ClientDetailPage.tsx:265-272` (`WarningModal`, "This action cannot be undone"). The wording happens to be accurate given the backend's `remove()` is a hard delete, but the schema carries unused soft-delete columns (`deleted_by`, `deleted_at`, visible on the frontend `Project` type itself at `projectType.ts:124-125`), so the "cannot be undone" copy is really just an accidental match to a bug rather than an intentional design decision — there is no restore/recover UI anywhere in this module, consistent with there being no soft-delete to recover from.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)
- No dedicated "remove team member from a live project" action outside the full edit form: `ProjectTeamTable.tsx` (detail page) is read-only display only, and the only way to remove a member is to open `AddProjectModal` in edit mode, delete the row in `TeamTab.tsx:160-166`, and resubmit — which round-trips through `useUpdateProject.ts:38-45`'s `addTeamMembers` call that (per the backend audit) replaces the team without firing any notification. This matters because "assign" and "remove" are functionally indistinguishable to the backend/notification layer, so team members are silently added/removed with no audit trail visible to the user.
- `useAddProjectTeam.ts` is a fully-formed hook (toast + cache invalidation) that is dead — both `useCreateProject.ts` and `useUpdateProject.ts` reimplement the same `addTeamMembers` call inline instead of reusing it, meaning cache invalidation/toast logic for team assignment exists in three places that can drift.
- Client-scoped list (`getProjects`) and org-wide list (`getAllProjects`) are two separate API functions/hooks/param shapes for what is conceptually one "list projects" operation, requiring every consumer to know which one applies; the type mismatch below is a direct symptom of that duplication.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)
- **Status filter param mismatch that reaches the known backend bug.** `ClientDetailPage.tsx:49` sends `status`, `ProjectPage.tsx:56` sends `project_status` — for the same filtering concept against two different endpoints; `GetProjectsParams` (`projectType.ts:178-186`) only models `status`, so `ProjectPage.tsx`'s `project_status` key isn't even type-checked against the params interface it's passed through. See Section 3 for why this is user-triggerable and hits the live SQL bug.
- **Wrong field rendered in the client-scoped project table.** `projectColumns.tsx:37` uses `accessorKey: 'status'` (the generic base-entity status field, `Project.status` at `projectType.ts:117`) to render the Status column and switches on values `'ACTIVE' | 'DRAFT' | 'ON_HOLD' | 'COMPLETED'`, but those are actual values of `project_status` (`projectType.ts:130`), not `status`. The org-wide equivalent, `allProjectsColumns.tsx:42`, correctly uses `accessorKey: 'project_status'`. This means the Status column on `ClientDetailPage.tsx`'s project table is showing/switching on the wrong field and will likely render blank or an unstyled tag for every row.
- **Dead code with a compile error.** `ProjectLeadBar.tsx:12` accesses `project.lead_id`, a property that does not exist on the `Project` interface (`projectType.ts:113-136`). Running `tsc --noEmit -p tsconfig.app.json` confirms `TS2339: Property 'lead_id' does not exist on type 'Project'`. The component is unused (not imported by `ProjectDetailPage.tsx` or anywhere else), but it still fails `npm run typecheck`; it only doesn't block `npm run build` because the build script (`package.json:8`) is `vite build`, which does not type-check.
- **Incomplete status-to-style mapping.** `ProjectDetailHeader.tsx:12-25`'s `getStatusClass` switch handles `IN_PROGRESS`, `ACTIVE`, `COMPLETED`, `ON_HOLD` but not `DRAFT`, even though `DRAFT` is a valid `ProjectStatus` value (`projectEnums.ts:1-7`) offered in every status dropdown (`STATUS_OPTIONS`, `projectOptions.ts:11-17`) and filter (`ProjectPage.tsx:30-36`, `ClientDetailPage.tsx:24-30`). A project left in `DRAFT` shows an unstyled status badge on its detail page.
- **Two more unrelated type errors inside the audited paths.** `tsc --noEmit` also reports `src/pages/project/timesheet/components/TimesheetCalendar.tsx:286` (`Cannot find name 'NavigateAction'`), `TimesheetCalendar.tsx:435` (no overload matches `onNavigate`), and `TimesheetEntryModal.tsx:123` (`string | undefined` not assignable to `string`) — the timesheet views ship with real type errors that `vite build` silently tolerates.
- Three components are entirely dead: `ProjectLeadBar.tsx`, `ProjectOverviewCard.tsx` (both under `ProjectDetail/`), and `ProjectSummaryCard.tsx` (timesheet) — none are imported anywhere in the app, adding maintenance surface with zero runtime value.

### Technical (performance, security, accessibility, test coverage)
- No test files exist anywhere under `src/features/project/` or `src/pages/project/` (no `*.test.tsx`/`*.spec.tsx` found) — none of the CRUD, team-assignment, or timesheet flows have automated coverage, so the bugs above were only discoverable by direct code reading.
- `TeamTab.tsx:47-57` seeds team fields from `useProjectTeam(projectId)` into the form's `useFieldArray` on every render where `teamMembers.length === 0`, with no guard against the team-fetch failing or racing the initial empty state — if the team query errors after the array is already non-empty from a prior open/close cycle, stale data can persist silently (toast fires but form doesn't reconcile).

## 5. Top 3 Priorities

1. **Fix the `status` vs `project_status` query-param mismatch in `ClientDetailPage.tsx:49`** (and align `GetProjectsParams`) — this is the one path in the entire webapp that actively drives traffic into the backend's broken `findAllByClient` SQL filter; any user filtering a client's projects by status today gets a 500.
2. **Fix the Status column in `projectColumns.tsx:37`** to read `project_status` instead of `status` — every project row in the client-scoped table is currently showing the wrong field for its most visible piece of state.
3. **Delete the three dead components** (`ProjectLeadBar.tsx`, `ProjectOverviewCard.tsx`, `ProjectSummaryCard.tsx`) or wire them in — `ProjectLeadBar.tsx` specifically fails `tsc --noEmit` today (`lead_id` doesn't exist on `Project`), so the module currently cannot pass a clean typecheck.
