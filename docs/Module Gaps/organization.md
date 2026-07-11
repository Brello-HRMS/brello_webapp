# Module: Organization (webapp)

## 1. Purpose & Current Usage

Two cooperating slices:

- **`src/features/organization/`** — the post-signup "Organisation Profile" view/edit surface.
  - `api/index.ts` — `getOrgProfile`, `updateOrgProfile`, `getOrgStats` (thin wrappers over `GET/PATCH /organization-profiles/*` and `GET /organizations/:id/stats`).
  - `hooks/index.ts` — `useOrgProfile`, `useOrgStats` (React Query reads), `useUpdateOrgProfile` (mutation with toast + cache invalidation).
  - `components/` — `OrgProfileHeader` (logo upload + identity banner), `OrgCompanyCard` (legal name/registration/GST/domain/industry), `OrgContactCard` (email/phone), `OrgAddressCard` (address fields), `OrgPlatformCard` (read-only org id/created-on/employee count/billing link).
  - `types.ts` — `OrganizationProfile`, `UpdateOrgProfilePayload`, response wrappers.
- **`src/pages/organization/OrganizationProfilePage.tsx`** — composes the above cards, fetches profile + stats via `getOrganizationId()` (`src/utils/authUtils.ts:34`), mounted at route `organisation/profile` in `src/routes/adminRoutes.tsx:53`.
- **Signup/setup wizard** (lives in `src/features/auth/`, not under `organization/`, but is the only producer of an `OrganizationProfile`): `RegisterForm.tsx` → `OtpForm.tsx` → `Login.tsx` (OTP login) → `OtpForm.tsx` (login branch) → `LeadForm.tsx` (`useSetupCompany`, POST `/organizations/setup`) → `WelcomeScreen.tsx`.

No dedicated "org settings" page exists — `OrganizationProfilePage` is the only settings-like surface. The "Setting" item in `Header.tsx:88-95` (mobile profile menu) only closes the dropdown; it has no `action` navigation, i.e. it's an unwired stub.

No static in-app link to `organisation/profile` was found in the sidebar config (`src/features/sidebar/sidebarConfig.ts`) or `Header.tsx`; the sidebar menu is backend-driven (`src/features/sidebar/api/sidebar.ts:6-8`, `GET /menu`), so reachability of the page couldn't be fully confirmed from the frontend alone — flagged as unverified rather than dead code.

## 2. Intended / Ideal Usage

- User registers with full contact details (including phone) → verifies OTP → logs in → completes company setup (`LeadForm`) → lands on `WelcomeScreen` → later manages company details, contact info, address, and branding from `OrganizationProfilePage`.
- Edits to profile sub-sections should be validated to the same rigor as initial signup (format checks, not just non-empty checks) since they write to the same backend columns (including the NOT NULL/unique `phone` column called out in the backend audit).

## 3. Cross-Module Connections

**Depends on:**
- `src/utils/authUtils.ts` (`getOrganizationId`, `getAuthUser`) — sourced from the `auth_response` cookie.
- `src/utils/cookieUtils.ts` — persists the entire auth payload (access/refresh tokens, user, org id) via `document.cookie`.
- `src/lib/axios.ts` — `apiClient`, token injection, `parseApiError`.
- `src/api/documents.ts` — logo upload/signed URL for `OrgProfileHeader`.
- `src/features/auth/api/useIndustryTypes.ts` — shared industry list for both `LeadForm` and `OrgCompanyCard`.

**Depended on by:**
- `OrgPlatformCard` links out to `/billing/plan` (billing feature).
- Dashboard "setup guide" (`useOrgSetupStatus`, `SetupGuard.tsx`) checks a *different* org-completeness concept (checklist %), unrelated to `OrganizationProfile` — worth noting these are two separate "org setup" ideas that share vocabulary but not code.

**Missing/expected connection — the phone-null backend bug:**
The backend bug (`OrganizationProfile.phone` NOT NULL/unique, populated from nullable `User.phone`) is **not reachable through the standard frontend flow**:
- `RegisterForm.tsx:104-114` makes `phone` `required` with a `/^[0-9]{10}$/` pattern before the user account is even created (`POST /leads/register`).
- The only route to `LeadForm`/`setupCompany` is `OtpForm.tsx:113-115` (`resource === 'login'` branch, after a full login+OTP cycle), so by the time `setupCompany()` fires, the acting user already passed registration's phone validation. No route or component allows reaching `LeadForm` without an already-registered (and thus phone-validated) `userId`.
- `LeadForm.tsx` itself collects no phone field at all (only logo, company name, workspace URL, industry) — it relies entirely on the phone already present on the `User` row from registration.
- However, there is **no safety net if the bug is ever hit anyway** (e.g. a user record created through a path other than `RegisterForm` — admin backfill, future invite flow, etc.): `parseApiError` (`src/lib/axios.ts:35-41`) passes `error.response.data?.message` straight through, and `LeadForm.tsx:113-117` renders that string verbatim — a raw Postgres constraint error would be shown to the end user as-is, with no generic "something went wrong, contact support" fallback for 5xx responses.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Triplicated edit-card pattern.** `OrgCompanyCard.tsx:27-71`, `OrgContactCard.tsx:22-39`, and `OrgAddressCard.tsx:36-74` each re-implement identical `isEditing`/`handleEdit`/`handleSave`/local `FormState` boilerplate with no shared `EditableCard` or `useEditableForm` abstraction. Matters because each copy has independently drifted in validation strictness (see Coding below), and any future field added to one card has to be hand-copied into the pattern for the next.
- **"Org settings" is a stub, not a page.** `Header.tsx:88-95` renders a "Setting" action item with no navigation wired (`action: () => setIsProfileOpen(false)` only). Matters because there is currently no distinct settings surface beyond the profile page, so the concept referenced in the UI doesn't exist yet.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling)

- **Weaker phone/email validation on edit than on signup.** `OrgContactCard.tsx:60-66` and its Save-disable check `OrgContactCard.tsx:79` only guard against an empty string (`!form.phone`/`!form.email`); there is no 10-digit pattern (unlike `RegisterForm.tsx:106-112`) and no email regex (unlike `RegisterForm.tsx:94-100`). A whitespace-only phone would pass the `!form.phone` truthiness check and reach the PATCH call. Matters because this is the one post-signup place a user can still write to the same NOT-NULL/unique `phone` column the backend bug centers on, and it's validated more loosely than the original signup form.
- **Raw backend error surfaced verbatim to users.** `LeadForm.tsx:113-117` and `parseApiError` in `src/lib/axios.ts:35-41` show `error.response.data?.message` directly with no fallback messaging for unexpected 5xx errors — if the backend's raw DB constraint violation is ever hit, the user sees the opaque Postgres error, not a friendly message.
- **Type/response contract mismatch worked around with a comment.** `src/api/documents.ts:22-24` types `getDocumentSignedUrl` as `Promise<{ url: string }>`, but the real response is wrapped (`{ data: { url } }`) — `OrgProfileHeader.tsx:22-30` has to manually unwrap it (`extractSignedUrl`) with a comment explaining the type is wrong. Matters because the type annotation actively lies about the contract; any other caller trusting the type will break silently.
- **No format validation on `workspaceURL`/subdomain.** `LeadForm.tsx:94-101` only requires non-empty; no slug/DNS-safe pattern is enforced client-side, so spaces/uppercase/special characters can be submitted and will surface as a raw backend error via the same unguarded error path above.
- **Unrollback-able logo upload.** `OrgProfileHeader.tsx:62-82` uploads the document (`uploadDocumentUrl` + `uploadDocumentData`) before calling `updateProfile`; if the profile PATCH fails after the upload succeeds, an orphaned document row is left behind with no cleanup.
- **Hardcoded trial copy.** `WelcomeScreen.tsx:20` shows a static `"⏱ Trial: 30 Days Remaining"` badge that isn't sourced from any plan/trial API data — will be wrong for any non-30-day plan.

### Technical (performance, security, accessibility, test coverage)

- **Zero test coverage.** No `*.test.*`/`*.spec.*` files exist under `src/features/organization/`, `src/pages/organization/`, or `src/features/auth/` — the entire signup wizard and profile-edit surface (both of which write to the fragile `OrganizationProfile` table) ship with no automated regression protection.
- **Auth/session state, including tokens, stored in a plain JS-writable cookie.** `src/utils/cookieUtils.ts:18-21` sets the full `auth_response` payload (access token, refresh token, user, `organization_id`) via `document.cookie` (no `HttpOnly`, since that's not settable from JS) — any injected script can read `getOrganizationId()`'s source data directly. The organization feature's entire identity/authorization (`getOrganizationId`, used across every card and hook here) depends on this cookie.
- **Logo upload trigger is not keyboard accessible.** `OrgProfileHeader.tsx:88` uses a `<div onClick={...}>` wrapping a hidden file input, with no `role="button"`, `tabIndex`, or `onKeyDown` handler — mouse-only interaction for changing the company logo.

## 5. Top 3 Priorities

1. **Add automated tests for the signup wizard (`RegisterForm` → `OtpForm` → `LeadForm`) and the profile-edit cards** — this is the only code path that writes to the NOT-NULL/unique `OrganizationProfile.phone` column the backend audit flagged as broken; right now a regression in either the registration phone requirement or the edit-card validation would go undetected until it hits production.
2. **Tighten `OrgContactCard`'s phone/email validation to match `RegisterForm`'s (reuse the shared `PhoneInput` + email regex)** — it's currently the one post-signup surface that can still write a loosely-validated value into the same fragile column, and reusing `PhoneInput` (already built and forwardRef-correct) also removes the duplicated custom `<Input type="tel">` pattern.
3. **Extract a shared `EditableCard`/`useEditableForm` abstraction for `OrgCompanyCard`/`OrgContactCard`/`OrgAddressCard`** — collapses three near-identical, already-drifting implementations into one, making future validation fixes (like #2) apply uniformly instead of needing to be re-applied per card.
