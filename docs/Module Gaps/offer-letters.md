# Module: Offer Letters (webapp)

## 1. Purpose & Current Usage
- Confirmed via `find src/features/offer-letters -type f`: **zero files exist anywhere in this tree.** Every subdirectory is an empty shell:
  `types/`, `hooks/`, `api/`, `validation/`, `store/`, and under `components/`: `ActivityTimeline/`, `WizardLayout/`, `OfferLetterCard/`, `OfferStatusBadge/`, `wizard-steps/`, `SignatoryFormDialog/`, `RevisionDialog/`, `CreateOfferDialog/`.
- A repo-wide grep for `offer-letters`, `OfferLetterCard`, `CreateOfferDialog`, `WizardLayout`, `SignatoryFormDialog` found no references anywhere outside this directory — it is not imported, not routed, not linked from navigation, and has no backend calls wired up.
- There is nothing to audit for "current usage" — this is pure unreferenced scaffolding. The folder/component names suggest a richer offer-letter workflow was planned (multi-step wizard, revision/negotiation support, activity timeline, dedicated signatory handling) distinct from the simpler feature that actually shipped under `letter-management`.

## 2. Intended / Ideal Usage
Based on naming alone, this was likely meant to become a full offer-management workflow with:
- `CreateOfferDialog` + `WizardLayout` + `wizard-steps/` — a guided multi-step offer creation flow (candidate details, compensation, terms, signatories).
- `SignatoryFormDialog` — structured capture of one or more signatories/approvers per offer.
- `RevisionDialog` — support for negotiating/revising an offer after it's issued (a capability the current `letter-management` feature does not appear to have).
- `ActivityTimeline` — an audit trail of status changes, revisions, and signatory actions per offer.
- `OfferLetterCard` / `OfferStatusBadge` — list/board view of offers with status visualization (draft, sent, negotiating, accepted, declined, etc.).

## 3. Cross-Module Connections
- The real, working feature today is `letter-management` (referenced elsewhere in the codebase per memory notes on Letter Template Visual Designer and Letter Management Architecture). `offer-letters` appears to be either:
  - an earlier or parallel design for a more sophisticated, revision-capable offer workflow that was abandoned before any code was written, or
  - a placeholder scaffolded ahead of a future initiative that never got resourced.
- There is no evidence it was ever meant to coexist with `letter-management` as a separate concern (e.g., "letters" vs. "offers" as distinct domains) — no shared types, no cross-imports, no partial wiring. It reads as dead scaffolding, not an in-progress migration.

## 4. Gaps

### Structural
The entire folder existing as empty, unreferenced scaffolding **is** the gap. Fourteen empty directories with no files, no route registration, and no imports anywhere in the app. This should either be deleted (if the offer-letter workflow concept was superseded by `letter-management`) or properly resourced and built out (if the richer revision/wizard/timeline workflow is still a real product need). Leaving it in place as-is only adds noise for future contributors trying to understand what's actually implemented.

### Coding
N/A — no code exists to critique.

### Technical
N/A — no implementation, no integration points, nothing to assess.

## 5. Top 3 Priorities
1. Decide whether to delete this scaffolding or build it out. If `letter-management` already covers the product need, remove `src/features/offer-letters/` entirely to avoid confusion. If the revision/wizard/timeline capabilities are still wanted, scope and resource them as a real project rather than leaving empty folders in the tree.
