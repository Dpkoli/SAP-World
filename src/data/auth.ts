export type LearnerProfile = {
  id: string;
  name: string;
  email: string;
  role: "learner";
};

export function learnerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
