import axios from "axios";

const ENV_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://CredSync-zknl.onrender.com";
const BACKEND_URL = ENV_URL.replace(/\/$/, "");

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
};

export const setAuthToken = (token?: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("auth_token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    window.localStorage.removeItem("auth_token");
    delete api.defaults.headers.common.Authorization;
  }
};

const existingToken = getStoredToken();
if (existingToken) {
  api.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data: { name: string; email: string; password: string }) =>
  api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    setAuthToken(null);
  }
};

export const getMe = () =>
  api.get("/auth/me");

// ── Borrower ──────────────────────────────────────────────────────────────────
export const savePersonalDetails = (data: {
  pan: string;
  dob: string;
  monthlyIncome: number;
  employmentMode: string;
}) => api.post("/borrower/personal-details", data);

export const uploadSalarySlip = (file: File) => {
  const form = new FormData();
  form.append("salarySlip", file);
  return api.post("/borrower/upload-slip", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const applyLoan = (data: { loanAmount: number; tenure: number }) =>
  api.post("/borrower/apply", data);

export const getMyLoans = () =>
  api.get("/borrower/my-loans");

// ── Sales ─────────────────────────────────────────────────────────────────────
export const getLeads = () =>
  api.get("/sales/leads");

// ── Sanction ──────────────────────────────────────────────────────────────────
export const getAppliedLoans = () =>
  api.get("/sanction/loans");

export const approveLoan = (id: string) =>
  api.patch(`/sanction/loans/${id}/approve`);

export const rejectLoan = (id: string, reason: string) =>
  api.patch(`/sanction/loans/${id}/reject`, { reason });

// ── Disbursement ──────────────────────────────────────────────────────────────
export const getSanctionedLoans = () =>
  api.get("/disbursement/loans");

export const disburseLoan = (id: string) =>
  api.patch(`/disbursement/loans/${id}/disburse`);

// ── Collection ────────────────────────────────────────────────────────────────
export const getDisbursedLoans = () =>
  api.get("/collection/loans");

export const recordPayment = (id: string, data: {
  utrNumber: string;
  amount: number;
  paymentDate: string;
}) => api.post(`/collection/loans/${id}/payment`, data);

export const getLoanPayments = (id: string) =>
  api.get(`/collection/loans/${id}/payments`);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get("/admin/stats");

export const getAllLoans = (status?: string) =>
  api.get("/admin/loans", { params: status ? { status } : {} });

export const getAllUsers = () =>
  api.get("/admin/users");

export const createUser = (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => api.post("/admin/users", data);

export const deleteUser = (id: string) =>
  api.delete(`/admin/users/${id}`);
