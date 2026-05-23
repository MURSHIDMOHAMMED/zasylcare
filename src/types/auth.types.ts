export type AdminProfile = {
  id: string;
  companyId: string;
  email: string;
  fullName: string;
  role: "owner" | "admin" | "agent";
};
