import type { HierarchyNode } from '../types/hierarchyType';

/** Two-letter initials from a person's name, e.g. "Jane Doe" → "JD". */
export const getInitials = (node: Pick<HierarchyNode, 'firstName' | 'lastName'>): string => {
  const first = node.firstName?.[0] ?? '';
  const last = node.lastName?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
};

/** Deterministic accent color for a person's avatar based on their id. */
const AVATAR_COLORS = ['#8300ff', '#1d4ed8', '#067647', '#b54708', '#cf1322', '#4a2d6f', '#175cd3'];

export const getAvatarColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/** Case-insensitive match of a node against a search term (name/email/role/dept). */
export const nodeMatches = (node: HierarchyNode, term: string): boolean => {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return (
    node.fullName.toLowerCase().includes(t) ||
    node.email.toLowerCase().includes(t) ||
    (node.designation?.toLowerCase().includes(t) ?? false) ||
    (node.department?.toLowerCase().includes(t) ?? false)
  );
};

/**
 * Keep only the branches of the tree that contain a match, so a search on a
 * deep reportee still surfaces the whole path down to them.
 */
export const filterTree = (nodes: HierarchyNode[], term: string): HierarchyNode[] => {
  if (!term.trim()) return nodes;
  const out: HierarchyNode[] = [];
  for (const node of nodes) {
    const children = filterTree(node.children, term);
    if (nodeMatches(node, term) || children.length) {
      out.push({ ...node, children });
    }
  }
  return out;
};

export interface TreeIndex {
  byId: Map<string, HierarchyNode>;
  parentOf: Map<string, string>;
}

/** Build id→node and child→parent lookups from a set of tree roots. */
export const buildIndex = (roots: HierarchyNode[]): TreeIndex => {
  const byId = new Map<string, HierarchyNode>();
  const parentOf = new Map<string, string>();
  const walk = (node: HierarchyNode, parentId?: string) => {
    byId.set(node.id, node);
    if (parentId) parentOf.set(node.id, parentId);
    node.children.forEach((c) => walk(c, node.id));
  };
  roots.forEach((r) => walk(r));
  return { byId, parentOf };
};

/** Manager chain within the loaded tree: direct manager first → top last. */
export const getAncestors = (id: string, index: TreeIndex): HierarchyNode[] => {
  const chain: HierarchyNode[] = [];
  const seen = new Set<string>([id]);
  let parentId = index.parentOf.get(id);
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = index.byId.get(parentId);
    if (!parent) break;
    chain.push(parent);
    parentId = index.parentOf.get(parentId);
  }
  return chain;
};

/** Total number of people across a set of tree roots (roots included). */
export const countPeople = (roots: HierarchyNode[]): number => {
  let total = 0;
  const walk = (node: HierarchyNode) => {
    total += 1;
    node.children.forEach(walk);
  };
  roots.forEach(walk);
  return total;
};
