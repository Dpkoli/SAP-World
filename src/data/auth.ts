export type UserRole = "learner" | "admin";

export type LearnerProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const roleLabels: Record<UserRole, string> = {
  learner: "SAP learner",
  admin: "Platform admin",
};

export const rolePermissions: Record<UserRole, string[]> = {
  learner: [
    "learn:sap-processes",
    "execute:simulations",
    "submit:evidence",
    "ask:mentor",
  ],
  admin: [
    "learn:sap-processes",
    "execute:simulations",
    "submit:evidence",
    "ask:mentor",
    "admin:view-operations",
    "admin:view-learners",
    "admin:view-storage",
    "admin:approve-release",
    "admin:manage-identity",
  ],
};

export function hasRole(user: LearnerProfile | null, role: UserRole) {
  return Boolean(user && (user.role === role || user.role === "admin"));
}

export function learnerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
