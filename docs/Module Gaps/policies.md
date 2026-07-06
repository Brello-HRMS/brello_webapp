# Module: Policies (webapp)

## 1. Purpose & Current Usage
- A single admin-facing CRUD screen for company policy content, backed by `company-policy` on the server. Entry point: `src/pages/policies/PoliciesPage.tsx`, routed at `organisation/policies` in `src/routes/adminRoutes.tsx:92-99`, gated by `RequireAccess module={ModuleCode.ORG_POLICIES}`.
- Two parallel resources are managed from this one page: **Policies** (`src/features/policies/api/policy.ts`) and **Policy Types** (categories, `src/features/policies/api/policyType.ts`), each with its own CRUD hooks under `src/features/policies/hooks/`.
- Flow: `useGroupedPolicies` (`src/features/policies/hooks/useGroupedPolicies.ts`) fetches `/policies/grouped` and renders an `Accordion` per policy type with `PolicyAccordionItem` rows (`src/features/policies/components/PolicyAccordionItem/PolicyAccordionItem.tsx`). Creation is a 2-step wizard (`CreatePolicyDialog.tsx`) → success modal (`PolicyCreatedModal.tsx`) → optional immediate view. Viewing/editing/deactivating happens in a side-panel dialog (`PolicyViewDialog.tsx`), which lazy-loads full content via `usePolicyById` (`src/features/policies/hooks/usePolicyById.ts`).
- The page renders as both the "list" and the "reader" — there is no separate employee-facing policy viewer anywhere in the app; `organisation/policies` only appears in `adminRoutes.tsx`, not in `src/routes/employeeRoutes.tsx`. Any user who is granted VIEW on `ORG_POLICIES` gets the exact same admin UI (see §4 Coding for the authorization gap this creates).
- Dead/unused code:
  - `src/features/policies/hooks/usePolicies.ts` is an explicit legacy re-export of `useGroupedPolicies`, kept only "for backward compatibility" (comment at line 1) — no callers found besides the export itself.
  - `src/features/policies/hooks/useDeletePolicyType.ts` is defined but never imported anywhere in the app — policy types can be created/renamed via `PolicyTypeSelect.tsx` but never deleted from the UI.
  - `PolicyFormData.sortBy` (`src/features/policies/types/policyType.ts:92`) is initialized in `CreatePolicyDialog.tsx:54` but no form control ever sets or reads it — pure dead field.
  - `PolicyFormData.iconColor` (the whole "Policy icon" picker grid in `CreatePolicyDialog.tsx:195-218`) is tracked in local state and highlighted on click, but `handleCreateSuccess` in `PoliciesPage.tsx:101-118` never forwards `iconColor` to `createPolicyMutation` — the field doesn't exist on `CreatePolicyParams` at all (`src/features/policies/types/policyType.ts:70-76`). The entire icon-selection step is cosmetic; the icon shown per group actually comes from the policy **type's** icon, not the individual policy.

## 2. Intended / Ideal Usage
- Correct usage for a real policy-management feature would track, per employee, which policy version they viewed/acknowledged and when, gate certain policies as "required to accept," and version content so edits to a policy don't silently rewrite what an employee previously acknowledged.
- Note: no such tracking exists anywhere in this frontend, which is actually *consistent* with the backend (confirmed against `brello_server/docs/Module Gaps/company-policy.md`: `CompanyPolicy` has no relation to `User`, no versioning, no "required" flag). Unlike the initial hypothesis, the webapp does **not** contain a misleading "I have read this" checkbox or acknowledge button — `PolicyViewDialog.tsx` only exposes Edit/Deactivate actions, so there is no UI falsely implying a read-receipt feature exists. The gap here is one of pure absence, not one of a deceptive UI.
- Ideal usage would also include: a reactivate path for deactivated policies (see §4), a way to change a policy's category/description after creation, and RBAC-gated action buttons per action (view/edit/delete), not just create.

## 3. Cross-Module Connections
- **Depends on:**
  - `useModuleAccess` / `ModuleCode.ORG_POLICIES` (`src/hooks/useModuleAccess.ts`, `src/enum/modules.ts:11`) for permission checks.
  - Shared `MarkdownEditor` (`src/components/common/MarkdownEditor/MarkdownEditor.tsx`, wraps `md-editor-rt`) for both authoring and read-only rendering of policy content.
  - Shared `Accordion`, `Dialog`, `Modal`, `AlertModal`, `ListControls`, `NoDataFound`, `Popover` from `src/components/common`.
- **Depended on by:**
  - `SetupGuide` (`src/features/dashboard/components/SetupGuide/SetupGuide.tsx:54-55,145-147`) links to `/organisation/policies` as an onboarding checklist step ("Create your company policies").
  - `SetupGuard` (`src/components/common/SetupGuard/SetupGuard.tsx:16`) special-cases the `/organisation/policies(/.*)?` path in its setup-completion gating regex.
- **Missing/expected connections:**
  - No linkage from any employee-facing surface (dashboard, onboarding, HR workflows) to a read-only policy list — policies exist only inside the admin org-settings area, so there is no product surface where a non-admin employee is actually shown these policies to read, despite the CMS being framed as content for the whole company (`CreatePolicyDialog.tsx:233`: "Visible to employees after saving").
  - No connection to the Audit Log module despite policy create/update/delete/deactivate being exactly the kind of change an audit trail module would want to capture.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)
- **Policy deactivation is a one-way trap with no reactivate path.** `handleDeactivate` in `PoliciesPage.tsx:143-148` only ever sends `{ status: 'INACTIVE' }`; there is no button, filter, or toggle anywhere in `PoliciesPage.tsx` or `PolicyViewDialog.tsx` that sets status back to `ACTIVE`, and there's no UI to even list/filter INACTIVE policies. Once an admin clicks "Deactivate," the policy becomes permanently unmanageable through the webapp (only a raw API call could undo it). This matters because "Deactivate" reads like a safe, reversible action in the UI, but functionally it's closer to an unrecoverable soft-delete.
- **Edit flow can't change category or description.** `PolicyViewDialog.tsx`'s edit mode only exposes `editTitle`/`editContent` (lines 30-32, 100-114), and `PoliciesPage.tsx:282-290` only ever PATCHes `{ title, content }` — even though `UpdatePolicyParams` supports `description` and `type_id` (`src/features/policies/types/policyType.ts:78-84`). An admin who mis-categorizes a policy at creation time has no in-app way to fix it afterward.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling, unsafe assumptions)
- **Edit/Delete/Deactivate are not permission-gated, only Create is.** `PoliciesPage.tsx:150` destructures only `hasCreateAccess` from `useModuleAccess(ModuleCode.ORG_POLICIES)` and uses it solely to hide the "Add policy" button (line 191). The Edit/Delete menu in `PolicyAccordionItem.tsx:23-41` and the Edit/Deactivate buttons in `PolicyViewDialog.tsx:54-77` render unconditionally for anyone who can reach the page at all. Since `ActionCode` distinguishes `view`/`create`/`edit`/`delete` (`src/enum/modules.ts:51-60`), any user granted only VIEW access to `ORG_POLICIES` (e.g., a plain employee given read access to browse policies) gets full edit/delete/deactivate capability in the UI. This is a real authorization gap, not just UX.
- **Dead code:** `useDeletePolicyType` (`src/features/policies/hooks/useDeletePolicyType.ts`) is fully implemented but never called — policy types can only be created/renamed, never deleted, from the UI. `usePolicies.ts` is an explicit unused legacy re-export. `PolicyFormData.sortBy` and `PolicyFormData.iconColor` are captured in state but never reach the API (see §1).
- **No confirmation on Deactivate** while Delete has one. `PolicyViewDialog.tsx:58` calls `onDeactivate(policy)` directly from an onClick with no intermediate confirm step, whereas the less-frequently-destructive-sounding Delete flows through `AlertModal` in `PoliciesPage.tsx:296-309`. Given Deactivate is effectively unrecoverable in-app (see Structural gap above), the lack of confirmation is inconsistent and risky.
- **Keyboard accessibility gap:** `PolicyAccordionItem.tsx:44-50` gives the row `role="button"` and `tabIndex={0}` with an `onClick`, but no `onKeyDown` handler — keyboard-only users tabbing to a policy row cannot open it via Enter/Space.

### Technical (performance, security, accessibility, test coverage)
- **No test coverage:** no `*.test.tsx`/`*.spec.tsx` files exist anywhere under `src/features/policies/` or `src/pages/policies/` (confirmed via directory listing) — none of the CRUD flows, permission gating, or the grouped/filter/sort logic in `PoliciesPage.tsx:72-99` have any automated coverage.
- **Client-side-only search/sort with no pagination:** `filteredGroups` in `PoliciesPage.tsx:72-99` filters and sorts the entire in-memory `groups` array on every keystroke; fine at small scale but there's no server-side search/pagination hook-up if the policy count grows.

## 5. Top 3 Priorities
1. **Gate Edit/Delete/Deactivate behind their own action codes** (`hasEditAccess`/`hasDeleteAccess`), not just `hasCreateAccess` — today a view-only grant on `ORG_POLICIES` implicitly grants full write access in the UI, which is a genuine security/authorization bug, not a cosmetic one.
2. **Add a reactivate path (and a way to view INACTIVE policies)** — deactivation is currently a UI dead-end that behaves like an unrecoverable delete without the delete confirmation or any way back, which is a trap for admins.
3. **Remove or wire up the dead icon-picker/sort-by fields and the unused `useDeletePolicyType`/`usePolicies` code** — low risk, but the icon picker in particular actively misleads admins into thinking their icon choice is saved when it's silently discarded.
