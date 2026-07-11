# Module: Designation (webapp)

## 1. Purpose & Current Usage

- CRUD for organisation-level designations (job titles), scoped to a department, with active/inactive status. Employees are assigned a designation and can be drilled into per-designation.
- **API layer**: `src/features/designation/api/designation.ts` — `getDesignations`, `getDesignationById`, `createDesignation`, `updateDesignation`, `deleteDesignation` — thin wrappers over `GET/POST/PATCH/DELETE /designations(/:id)`.
- **Hooks**: `useDesignations` (list, react-query, `src/features/designation/hooks/useDesignations.ts`), `useCreateDesignation`, `useUpdateDesignation`, `useDeleteDesignation` (all in `src/features/designation/hooks/`) — each invalidates the `['designations']` query key and shows a toast on success/error.
- **Pages**:
  - `src/pages/designation/DesignationPage.tsx` — list page (grid/table toggle, search, sort, status filter, multi-select, Excel export, add/edit modal, deactivate/delete confirmation modals). Routed at `organisation/designations` (`src/routes/adminRoutes.tsx:76-81`).
  - `src/pages/designation/DesignationDetailPage.tsx` — shows employees assigned to one designation, with add/unmap-employee flows. Routed at `organisation/designations/:id` (`src/routes/adminRoutes.tsx:83-89`). Both routes are gated by `RequireAccess module={ModuleCode.ORG_DESIGNATIONS}`.
- **Components**: `AddDesignationModal` (create/edit form, `src/features/designation/components/AddDesignationModal/AddDesignationModal.tsx`), `DesignationCard` (grid tile, `.../DesignationCard/DesignationCard.tsx`), `DesignationActionMenu` (popover with Edit/Activate-Deactivate/Delete, `.../DesignationActionMenu/DesignationActionMenu.tsx`), `designationColumns` (table view column defs, `src/features/designation/columns/designationColumns.tsx`).
- Consumed elsewhere: `EmploymentDetailsStep.tsx` (employee onboarding wizard, `src/features/employee/components/AddEmployeeWizard/steps/EmploymentDetailsStep.tsx:12,40,48-51`) and `AddDesignationModal.tsx` itself both call `useDesignations()` to populate designation dropdowns.
- **Dead/unused**: The "Cannot Deactivate Designation" `AlertModal` in `DesignationPage.tsx:339-354` (state `showCannotDeactivateModal`, `DesignationPage.tsx:52`) is built and rendered but `setShowCannotDeactivateModal(true)` is never called anywhere in the file — it is unreachable dead code. The "Export" button on `DesignationDetailPage.tsx:75-78` has no `onClick` handler and does nothing.

## 2. Intended / Ideal Usage

- Admin creates a designation under a department, assigns employees to it via the employee wizard or the designation detail page, and can deactivate/delete a designation once it's no longer needed.
- Before deactivating or deleting, the UI should check whether any active employees are currently assigned and block/warn the admin (the `AlertModal` copy in `DesignationPage.tsx:342-349` — "Designations with active employees cannot be deactivated or deleted... Reassign all active members... before you can deactivate" — describes exactly this intended flow), then redirect them to `DesignationDetailPage` to reassign staff before retrying.
- Only active designations should be selectable when assigning a designation to a new/existing employee.
- Grid and table views of the list page should offer equivalent actions (view/edit/activate-deactivate/delete).

## 3. Cross-Module Connections

- **Depends on**: `department` feature for `useDepartments()` (department dropdown + icon in `AddDesignationModal.tsx:10,136-145`); `users` feature (`useUsersList`, `useUnmapUsers`, `AddEmployeeModal`) on `DesignationDetailPage.tsx:8-10,36-37`); shared `components/common` (`DataTable`, `WarningModal`, `AlertModal`, `ListControls`, `PageHeader`, `ExcelExport`).
- **Depends on it**: `employee` feature's onboarding wizard (`EmploymentDetailsStep.tsx:12,40,48-51`) reads designation list for the designation-assignment dropdown; `users` feature's `User`/`UserDesignation` types carry `designationId`/`designation` (`src/features/users/types/userType.ts:9,21,27,87-88`).
- **Not connected** (worth flagging): `letter-management`'s "designation" fields (`SignatoryFormModal.tsx`, `SignatoryCard.tsx`, `letterSchemas.ts`, `TemplateLivePreview.tsx`) are free-text strings for signatories/merge-field previews, not linked by ID to this module's `Designation` entities — there is no client-side awareness in letter-management of whether an employee's designation is active, inactive, or has been reassigned, so the frontend cannot reflect the backend's known issue (per `brello_server/docs/Module Gaps/designations.md`) of stale designations surfacing in offer/relieving letters.
- `src/features/platform/designations/` is a separate, unrelated platform-admin catalog of default designation names (own `api.ts`/`hooks.ts`/`DesignationFormModal.tsx`) — it seeds org setup but has no runtime coupling to `src/features/designation/`.
- **Missing connection**: no query params or client-side filter tie `department_id` selection to designation options in `AddDesignationModal` beyond storing the FK — picking a department doesn't filter/scope which designations are shown anywhere that lists designations by department.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- Two views of the same list (grid `DesignationCard` vs table `designationColumns`) implement action menus independently and are not at feature parity: the table view's `TableActions` (`src/components/common/TableActions/TableActions.tsx:1-38`) only exposes View/Edit/Delete, with no Activate/Deactivate action, while the grid's `DesignationActionMenu` (`src/features/designation/components/DesignationActionMenu/DesignationActionMenu.tsx:28-55`) exposes Edit/Activate-Deactivate/Delete — an admin in table view has no way to reactivate a deactivated designation at all. This matters because it makes a core workflow (reactivation) invisible/inaccessible depending on which view toggle the admin happens to be on.
- Client-side pagination/sorting/filtering is done entirely in-memory over the full designation list (`DesignationPage.tsx:81-117` — filter, sort, then `.slice()` for "pagination"), even though `getDesignations` accepts `status`/`search` params and the query key includes `params` (`useDesignations.ts:15`) implying server-side filtering was intended; this won't scale and duplicates logic the API already partially supports.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling)

- **No warning before deactivating/deleting an in-use designation**: `handleDeactivateClick`/`handleDeactivate` (`DesignationPage.tsx:129-153`) and `handleDeleteClick`/`handleDeleteDesig` (`DesignationPage.tsx:134-164`) go straight from action-menu click to a generic `WarningModal` ("Deactivate the X designation?" / "Are you sure you want to delete...") with no check of whether employees are currently assigned — there is no client-side employee-count lookup anywhere in the file. The purpose-built `AlertModal` for exactly this case (`DesignationPage.tsx:339-354`, `showCannotDeactivateModal`) is fully implemented (title, message, "View Employees" CTA that navigates to the detail page) but `setShowCannotDeactivateModal(true)` is never invoked — it is unreachable. Combined with the backend having zero referential-integrity checks (per prior audit), an admin can deactivate/delete a designation with active employees with only a generic "are you sure" prompt that never mentions the impact, mirroring the exact server-side gap on the client.
- **Inactive designations remain assignable to employees**: `EmploymentDetailsStep.tsx:40,48-51` calls `useDesignations()` with no `status` filter and maps every returned designation (active or inactive) into the "Select designation" dropdown options for new-employee onboarding — an admin can knowingly or unknowingly assign a brand-new employee to an inactive designation.
- `DesignationDetailPage.tsx:33-34` fetches the full unfiltered designation list via `useDesignations()` and does a client-side `.find()` to get one designation by id, instead of using `getDesignationById` (which exists in the API layer, `designation.ts:29-31`, but is never called from any hook/page) — wastes payload and means the detail page silently shows nothing useful if the designation isn't in the (paginated/filtered) list the hook happens to have cached.
- `DesignationPage.tsx:84-85` filters out `deleted_at` and locally-tracked `deletedIds` "in case the backend still returns them" — a defensive workaround suggesting the delete endpoint's response/list-invalidation behavior isn't trusted to be consistent.
- Export button on `DesignationDetailPage.tsx:75-78` renders but has no `onClick`, silently does nothing when clicked.
- No client-side validation (zod/schema) in `AddDesignationModal.tsx` for `code`/`title` beyond HTML `required` — no duplicate-code check, max length, or format constraint before submit; errors surface only via a generic toast from the mutation's `onError` (`useCreateDesignation.ts:18-21`).

### Technical (performance, security, accessibility, test coverage)

- No test files exist under `src/features/designation/` or `src/pages/designation/` (no `.test.ts(x)` / `.spec.ts(x)` found) — zero coverage for create/edit/deactivate/delete flows or the dead "cannot deactivate" modal.
- Full designation list is fetched unpaginated from the server (`getDesignations` has no page/limit params) and then paginated client-side (`DesignationPage.tsx:104-113`) — will degrade with a large designation count.
- `AddDesignationModal.tsx:48-49` types `designationsData?.data` map callbacks with `d: any` implicitly via untyped `.map` param usage patterns seen elsewhere (e.g. `EmploymentDetailsStep.tsx:48`, `d: any`), reducing type safety around a field (`designationId`) used for RBAC/HR-sensitive assignment.

## 5. Top 3 Priorities

1. **Wire up the "cannot deactivate/delete" check** — the `AlertModal` UI already exists (`DesignationPage.tsx:339-354`) but is dead code; add an employee-count check (client-side against `useUsersList`/`useDesignations` data or a dedicated endpoint) before opening the deactivate/delete `WarningModal`, and route to it instead when the designation is in use. This is the single biggest gap: the exact safeguard the product clearly intended is built but never triggered.
2. **Filter inactive designations out of employee-assignment dropdowns** (`EmploymentDetailsStep.tsx:48-51`) — prevents new hires from being assigned to a designation the org has already retired.
3. **Bring table view to parity with grid view** — add Activate/Deactivate to `designationColumns`/`TableActions` so reactivation isn't only possible from the grid layout.
