# Module: Billing (webapp)

## 1. Purpose & Current Usage

The billing feature lets an org admin view their current subscription, compare/change plans, pay outstanding invoices via Razorpay, and browse payment history.

- **API layer**: `src/features/billing/api/index.ts` — thin wrappers over `/billing/overview`, `/billing/plans`, `/billing/subscriptions/change-plan|cancel|cancel-pending-change`, `/billing/invoices*`, `/billing/payments/initiate|verify`.
- **Hooks**: `src/features/billing/hooks/index.ts` — React Query wrappers (`useSubscription`, `useOrgPlans`, `useChangePlan`, `useCancelSubscription`, `useCurrentInvoice`, `useInvoiceList`, `useInitiatePayment`, `useVerifyPayment`, etc.), all with toast-based error handling.
- **Razorpay integration**: `src/features/billing/hooks/useRazorpay.ts` — thin wrapper around the globally-loaded `window.Razorpay` (script tag in `index.html:14`), opens Razorpay's hosted checkout modal.
- **Components**: `CurrentPlanSummary`, `PricingSection` + `PlanCard` + `BillingCycleToggle`, `PaymentSuccessModal` (all under `src/features/billing/components/`).
- **Pages / routes** (`src/routes/adminRoutes.tsx:332-334`):
  - `billing/plan` → `BillingPlanPage.tsx` — plan summary, expiry/pending-change banners, plan comparison grid, cancel-subscription flow.
  - `billing/invoice` → `BillingInvoicePage.tsx` — current open invoice, "Pay Now" → Razorpay checkout → verify → `PaymentSuccessModal`.
  - `billing/payments` → `BillingPaymentHistoryPage.tsx` — paginated invoice history with status filter and PDF download.
- **Entry points**: the only in-app link into billing is `src/features/organization/components/OrgPlatformCard/OrgPlatformCard.tsx:50` (`navigate('/billing/plan')`). Billing has **no sidebar entry** (`src/features/sidebar/sidebarConfig.ts` has no billing item at all) — it's reachable only from that one org-settings card or a direct URL.
- Nothing in the feature is dead code — every component/hook/API function is wired to at least one page.

## 2. Intended / Ideal Usage

- A persistent, app-wide indicator (not just a card buried on one settings page) that reflects real subscription state — active/trial/grace/expired — sourced from the backend's own status fields, visible regardless of which page the user is on.
- Trial and expiry messaging driven by the backend's computed fields (`trial.days_remaining`, `trial.banner_level`) rather than being re-derived ad hoc on the frontend.
- Payment failure/cancellation handled gracefully: clear in-app feedback when a Razorpay payment fails or is abandoned, and a resilient post-payment redirect that always lands on a valid route.
- Card/payment data never touching Brello's own frontend code — delegated entirely to Razorpay's hosted checkout.

## 3. Cross-Module Connections

**Depends on:**
- `lib/axios` (`apiClient`) and `envVars.BRELLO_BASE_API` for all requests.
- `features/ToastFeature/ShowToast` for all error/success feedback.
- `components/ui/Button`, `components/common/Modal`, `components/common/PageHeader` (shared UI primitives).
- `utils/authUtils.getAuthUser()` for prefilling Razorpay checkout and the payment-success email.
- Globally-loaded Razorpay Checkout script (`index.html:14`) — loaded on every page of the app, not just billing pages.

**Depends on this:**
- `features/organization/components/OrgPlatformCard/OrgPlatformCard.tsx` — single link into `/billing/plan`.
- Nothing else in the app reads billing data — no other page/component consumes `useSubscription()` or checks `sub_status`/`is_trial`.

**Missing / expected connections:**
- No connection exists between subscription state and the rest of the app. Given the backend already enforces nothing when a subscription is expired/in grace (per `brello_server/docs/Module Gaps/billing.md`), the frontend compounds this: there is no global banner, no route guard, and no feature-gating anywhere outside the billing pages themselves. An org whose plan has fully expired sees **no visual difference** anywhere except if they happen to open `/billing/plan` directly — and even then the messaging is wrong (see Gaps below). This is the frontend half of a fully fail-open subscription lifecycle: neither side actually restricts or clearly signals an expired org.

## 4. Gaps

### Structural (architecture, component boundaries, coupling, missing abstractions)

- **Backend-provided trial banner data is computed but never rendered.** The API returns `trial.banner_level` and `trial.days_remaining` (`src/features/billing/types.ts:58-62`), but no component reads `banner_level`, and `CurrentPlanSummary.tsx:46-49` only uses `days_remaining` for a single line of text inside a card on the plan page. There is no global/header-level banner anywhere in the app (confirmed no `trial`/`billing`/`banner` references in `src/components/layout/Header/Header.tsx` or `MainLayout.tsx`). Since this data exists specifically to drive escalating urgency messaging, its complete absence from any persistent surface means an admin who never navigates to Billing has zero visibility into an expiring/expired subscription.
- **Billing has no sidebar entry** (`src/features/sidebar/sidebarConfig.ts` — no billing entry) and is reachable only via one card on the Organisation settings page (`OrgPlatformCard.tsx:50`) or a direct URL. This makes an already-invisible expiry state even harder to discover.
- **CTA gating is done by matching display copy instead of state.** `PlanCard.tsx:42` computes `isDisabled = cta === 'Current Plan'`, a string literal comparison against backend-supplied button text, even though the same object already carries structured `is_current`/`is_current_cycle` booleans (`types.ts:35-36`, used at `PlanCard.tsx:40` for styling only). If the backend ever changes the CTA copy, the "already on this plan" button silently becomes clickable/enabled with no code change on either side flagging it.

### Coding (bugs, dead code, inconsistent patterns, missing validation/error handling)

- **Broken post-payment-plan-change redirect.** `BillingPlanPage.tsx:83` navigates to `/billing/invoices` (plural) after an immediate plan change, but the only registered invoice route is `billing/invoice` (singular) (`src/routes/adminRoutes.tsx:333`). Right after telling the user "an invoice has been generated — please pay to activate," the app navigates them to a URL that doesn't match any route.
- **Expiry banner can never say "expired," only "expiring."** `BillingPlanPage.tsx:43-48` computes `expiryDaysRemaining` as `Math.max(0, Math.ceil((end_date - now) / 86400000))`, clamping negative values (already-past end dates) to `0`. Combined with the banner text at `BillingPlanPage.tsx:143-156` ("Your current plan will expire in **00 days**"), an org whose subscription expired days ago still sees a forward-looking "about to expire" message rather than any "your plan has expired" state — there is no expired-state UI at all.
- **Hardcoded, unconditional "30 day free trial" badge.** `PlanCard.tsx:64` renders `<div className={styles.trialBadge}>30 day free trial</div>` on every plan card regardless of whether the org is already on a paid plan, already used its trial, or is mid-trial — `PlanData` has no trial-eligibility field backing this text, so it's just static markup that can mislead an existing paying customer.
- **Razorpay failure path is not observed by the app.** `useRazorpay.ts:7-19`/`BillingInvoicePage.tsx:115-119` only wire up the success `handler` and a silent `modal.ondismiss` — there's no `payment.failed` event listener (Razorpay's own recommended pattern), so a declined/failed payment inside the checkout modal produces no app-level toast, log, or state update; the user only sees whatever Razorpay's own widget shows before closing.
- **No test coverage.** No `.test.*`/`.spec.*` files exist anywhere under `src/features/billing` or `src/pages/billing` — none of the plan-change, payment, or invoice flows have any automated coverage.

### Technical (performance, security, accessibility, test coverage)

- **Security (positive finding):** Payment collection is properly delegated — `useRazorpay.ts` only ever passes `order_id`/`key`/`amount` to Razorpay's hosted widget (loaded via `index.html:14`); no card/PAN data is handled, stored, or transmitted by Brello's own frontend code.
- **Razorpay checkout.js is loaded globally, not lazily.** `index.html:14` loads `https://checkout.razorpay.com/v1/checkout.js` unconditionally on every page load of the app, even for users who never visit a billing page, adding an unnecessary third-party script/network request app-wide.
- **Modal accessibility gaps affect billing flows.** The shared `Modal` component (`src/components/common/Modal/Modal.tsx`) has no `role="dialog"`/`aria-modal`, no focus trap, and no Escape-key handling — this affects the Cancel-Subscription confirmation modal and `PaymentSuccessModal` (which also disables the close icon via `showCloseIcon={false}` at `PaymentSuccessModal.tsx:63`, leaving keyboard/screen-reader users with only the two in-content buttons to exit).

## 5. Top 3 Priorities

1. **Surface real subscription/trial state outside the billing pages.** The backend already computes `trial.banner_level`/`days_remaining`, but nothing outside `CurrentPlanSummary` (one card on one page reachable only via a settings link) shows it — combined with the backend's fail-open enforcement, an expired org currently gets no signal anywhere in the product.
2. **Fix the expiry banner to distinguish "expiring soon" from "already expired"** (`BillingPlanPage.tsx:43-48`) — the current clamped-to-zero math means an expired subscription is permanently mis-described as "expiring in 00 days."
3. **Fix the `/billing/invoices` vs `/billing/invoice` route mismatch** (`BillingPlanPage.tsx:83` vs `adminRoutes.tsx:333`) — a one-line typo that breaks navigation at the exact moment a user needs to pay to activate a just-changed plan.
