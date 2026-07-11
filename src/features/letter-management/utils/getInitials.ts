// NOTE (simplification): `signature_document_id` requires a signed-url lookup
// (GET /documents/:id/signed-url) to resolve into a viewable image, and there is
// no existing hook that turns "document id -> <img> src" into a single call in
// this codebase (see src/features/employee for the closest precedent, which
// resolves an already-URL-shaped `avatar` field, not a bare document id). To
// keep signatory screens self-contained we render the signatory's initials
// instead of fetching/rendering the actual signature image. Swapping in the
// real image is a follow-up: call getDocumentSignedUrl(signature_document_id) +
// resolveAssetUrl, then render through DocumentRender the same way
// FeedbackDetailDrawer does.
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
