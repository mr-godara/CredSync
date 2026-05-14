"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getMe, logout, getAppliedLoans, approveLoan, rejectLoan } from "@/lib/api";

export default function SanctionDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [confirmSanctionId, setConfirmSanctionId] = useState<string | null>(null);
  const [rejectLoanId, setRejectLoanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "SANCTION") {
        router.push("/login");
        return;
      }
      setUser(res.data.user);
      fetchLoans();
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  async function fetchLoans() {
    try {
      const res = await getAppliedLoans();
      setLoans(res.data.loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleApprove(id: string) {
    try {
      await approveLoan(id);
      toast.success("Loan sanctioned successfully");
      setConfirmSanctionId(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve loan");
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectLoan(id, rejectReason);
      toast.success("Loan rejected");
      setRejectLoanId(null);
      setRejectReason("");
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject loan");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F1E8" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#FFFCF7", borderBottom: "1px solid #E2D2BE", padding: "16px 32px" }} className="flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" style={{ color: "#C08B2D", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
            CredSync
          </Link>
          <span style={{ background: "#FFF1DA", color: "#C08B2D", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Sanction Portal
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 16, background: "#EFE3D3", display: "flex", alignItems: "center", justifyContent: "center", color: "#C08B2D", fontWeight: 700, fontSize: "14px" }}>
              {user?.name?.charAt(0)}
            </div>
            <span style={{ color: "#1B1A16", fontSize: "14px", fontWeight: 600 }}>{user?.name}</span>
            <button onClick={handleLogout} style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginLeft: "12px" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1B1A16", letterSpacing: "-0.5px" }}>Pending Applications</h1>
            <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "4px" }}>Review and sanction borrower loan applications.</p>
          </div>
          <div style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "8px", padding: "8px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 600 }}>Total Pending</span>
            <span style={{ fontSize: "18px", color: "#1B1A16", fontWeight: 700 }}>{loans.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loans.length === 0 ? (
            <div style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#7B6E61" }}>
              No pending applications to review.
            </div>
          ) : (
            loans.map((loan) => (
              <div key={loan._id} style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(27,26,22,0.03)" }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1B1A16" }}>{loan.borrower.name}</h3>
                    <p style={{ fontSize: "14px", color: "#7B6E61" }}>{loan.borrower.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>Requested Amount</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#C08B2D", fontFamily: "monospace" }}>₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6 p-4 rounded-xl" style={{ background: "#F7F1E8", border: "1px solid #E2D2BE" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#7B6E61", fontWeight: 600, marginBottom: "2px" }}>Tenure</p>
                    <p style={{ fontSize: "15px", color: "#1B1A16", fontWeight: 700, fontFamily: "monospace" }}>{loan.tenure} days</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#7B6E61", fontWeight: 600, marginBottom: "2px" }}>Interest (12%)</p>
                    <p style={{ fontSize: "15px", color: "#1B1A16", fontWeight: 700, fontFamily: "monospace" }}>₹{loan.simpleInterest.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#7B6E61", fontWeight: 600, marginBottom: "2px" }}>Total Repayment</p>
                    <p style={{ fontSize: "15px", color: "#1B1A16", fontWeight: 700, fontFamily: "monospace" }}>₹{loan.totalRepayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#7B6E61", fontWeight: 600, marginBottom: "2px" }}>Salary Slip</p>
                    <a href={`http://localhost:5000${loan.borrower.salarySlipUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "#C08B2D", fontWeight: 600, textDecoration: "underline" }}>View Document</a>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E2D2BE]">
                  <button 
                    onClick={() => setRejectLoanId(loan._id)}
                    style={{ background: "#FFFCF7", border: "1px solid #F7B7A3", color: "#B42318", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => setConfirmSanctionId(loan._id)}
                    style={{ background: "#2F6B4F", border: "none", color: "#FFFCF7", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.2)" }}
                  >
                    Sanction Loan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Sanction Confirmation Modal */}
      {confirmSanctionId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1A16]/40 backdrop-blur-sm p-4">
          <div style={{ background: "#FFFCF7", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 48px rgba(27,26,22,0.1)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: "#D9F2E3", color: "#2F6B4F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px" }}>
              ✓
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1B1A16", marginBottom: "8px" }}>Sanction this loan?</h3>
            <p style={{ color: "#7B6E61", fontSize: "15px", lineHeight: "1.5", marginBottom: "32px" }}>
              Are you sure you want to approve this application? This action will generate a sanction letter and move the loan to the disbursement queue.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmSanctionId(null)} style={{ padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#1B1A16", background: "#F7F1E8", border: "none", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleApprove(confirmSanctionId)} style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#FFFCF7", background: "#2F6B4F", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.2)" }}>Yes, Sanction Loan</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectLoanId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1A16]/40 backdrop-blur-sm p-4">
          <div style={{ background: "#FFFCF7", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 48px rgba(27,26,22,0.1)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: "#FEE4E2", color: "#B42318", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px" }}>
              ×
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1B1A16", marginBottom: "8px" }}>Reject Application</h3>
            <p style={{ color: "#7B6E61", fontSize: "15px", lineHeight: "1.5", marginBottom: "24px" }}>
              Please provide a clear reason for rejecting this loan application. The borrower will see this reason.
            </p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Income criteria not met..."
              rows={3}
              style={{ width: "100%", background: "#F7F1E8", border: "1px solid #E2D2BE", borderRadius: "10px", padding: "12px", fontSize: "14px", color: "#1B1A16", outline: "none", marginBottom: "32px", resize: "none" }}
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectLoanId(null); setRejectReason(""); }} style={{ padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#1B1A16", background: "#F7F1E8", border: "none", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleReject(rejectLoanId)} style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#FFFCF7", background: "#B42318", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(185,28,28,0.2)" }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

