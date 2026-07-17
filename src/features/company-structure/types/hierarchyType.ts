/** A single person in the reporting hierarchy (mirrors the server HierarchyNode). */
export interface HierarchyNode {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  designation: string | null;
  department: string | null;
  avatar: string | null;
  reportsToId: string | null;
  directReportsCount: number;
  totalReportsCount: number;
  children: HierarchyNode[];
}

/** The logged-in user's own hierarchy ("My Team"). */
export interface MyHierarchy {
  self: HierarchyNode;
  managers: HierarchyNode[];
}
