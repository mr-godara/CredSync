"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyLoans, getMe, savePersonalDetails, uploadSalarySlip, applyLoan, logout } from "@/lib/api";
import { toast } from "sonner";

export default function MyLoansPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ monthlyIncome: "", employmentMode: "SALARIED" });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // New Loan States
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [loanConfig, setLoanConfig] = useState({ loanAmount: 100000, tenure: 180 });
  const [applyingLoan, setApplyingLoan] = useState(false);

  // Derived values for New Loan
  const interestRate = 12; // 12% p.a.
  const simpleInterest = (loanConfig.loanAmount * interestRate * loanConfig.tenure) / (100 * 365);
  const totalRepayment = loanConfig.loanAmount + simpleInterest;

  useEffect(() => {
    // Fetch user and loans in parallel
    Promise.all([getMe(), getMyLoans()])
      .then(([userRes, loansRes]) => {
        if (userRes.data.user.role !== "BORROWER") {
          router.push("/login");
          return;
        }

        setUser(userRes.data.user);
        setLoans(loansRes.data.loans);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleEditClick = () => {
    setEditData({
      monthlyIncome: user?.monthlyIncome || (loans.length > 0 ? loans[0]?.monthlyIncome : ""),
      employmentMode: user?.employmentMode || (loans.length > 0 ? loans[0]?.employmentMode : "SALARIED"),
    });
    setEditFile(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const pan = user?.pan || loans[0]?.pan;
      const dob = user?.dob || loans[0]?.dob;
      
      await savePersonalDetails({
        pan,
        dob,
        monthlyIncome: Number(editData.monthlyIncome),
        employmentMode: editData.employmentMode
      });

      if (editFile) {
        await uploadSalarySlip(editFile);
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Refresh user data to show updated fields immediately
      const userRes = await getMe();
      setUser(userRes.data.user);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.reason || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNewLoanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.pan || !user?.salarySlipUrl) {
      toast.error("Please complete your profile details and upload a salary slip first.");
      return;
    }
    setIsNewLoanModalOpen(true);
  };

  const handleApplyLoan = async () => {
    setApplyingLoan(true);
    try {
      await applyLoan({ loanAmount: loanConfig.loanAmount, tenure: loanConfig.tenure });
      toast.success("Loan application submitted successfully!");
      setIsNewLoanModalOpen(false);
      
      // Refresh loans
      const loansRes = await getMyLoans();
      setLoans(loansRes.data.loans);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply for loan.");
    } finally {
      setApplyingLoan(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      toast.error("Failed to log out");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">Loading...</div>;

  const displayPan = user?.pan || (loans.length > 0 ? loans[0]?.pan : "");
  const displayIncome = user?.monthlyIncome || (loans.length > 0 ? loans[0]?.monthlyIncome : 0);
  const displayEmp = user?.employmentMode || (loans.length > 0 ? loans[0]?.employmentMode : "");
  const displayDob = user?.dob || (loans.length > 0 ? loans[0]?.dob : "");
  
  const rawSlip = user?.salarySlipUrl || (loans.length > 0 ? loans[0]?.salarySlipUrl : "");
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://CredSync-zknl.onrender.com";
  const backendUrl = envUrl.replace(/\/$/, "");
  const displaySlip = rawSlip?.startsWith('http') ? rawSlip : `${backendUrl}${rawSlip}`;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #F7F1E8 0%, #FFF1DA 100%)" }}>
      {/* Top Navbar */}
      <nav style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226, 210, 190, 0.5)", padding: "16px 32px" }} className="flex justify-between items-center sticky top-0 z-50">
        <Link href="/" style={{ color: "#C08B2D", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
          CredSync
        </Link>
        <div className="flex items-center gap-6">
          <button onClick={handleNewLoanClick} style={{ color: "#7B6E61", fontSize: "14px", fontWeight: 600, border: "none", background: "none", cursor: "pointer", transition: "color 0.2s" }} className="hover:text-[#C08B2D]">
            New Application
          </button>
          <div className="flex items-center gap-3 border-l border-[#E2D2BE] pl-6">
            <Link href="/borrower/my-loans" style={{ color: "#1B1A16", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>
              My Loans
            </Link>
            <span className="mx-2 text-[#E2D2BE]">|</span>
            <span style={{ color: "#1B1A16", fontSize: "14px", fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
            <button 
              onClick={handleLogout}
              style={{ fontSize: "13px", color: "#B42318", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}
              className="hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pt-10 pb-0 h-[calc(100vh-85px)] flex flex-col overflow-hidden">
        <div className="flex items-end justify-between mb-8 flex-shrink-0">
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#1B1A16", letterSpacing: "-1px", lineHeight: 1.2 }}>Your Portfolio</h1>
            <p style={{ color: "#7B6E61", fontSize: "16px", marginTop: "8px" }}>Track and manage your active loan applications.</p>
          </div>
          <button 
            onClick={handleNewLoanClick}
            style={{ 
              background: "#1B1A16", color: "#FFFCF7", padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "14px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 8px 24px rgba(27,26,22,0.15)"
            }}
            className="hover:-translate-y-1 hover:shadow-xl"
          >
            + New Loan
          </button>
        </div>

        {loans.length === 0 ? (
          <div style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(20px)", borderRadius: "24px", padding: "80px 40px", textAlign: "center", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 24px 64px rgba(27,26,22,0.03)" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #FFF1DA 0%, #EFE3D3 100%)", borderRadius: "40px", display: "flex", alignItems: "center", justifyItems: "center", margin: "0 auto 24px", boxShadow: "inset 0 4px 12px rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: "32px", margin: "auto" }}>📄</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1B1A16", marginBottom: "12px", letterSpacing: "-0.5px" }}>No active loans</h3>
            <p style={{ color: "#7B6E61", fontSize: "15px", marginBottom: "32px", maxWidth: "340px", margin: "0 auto 32px", lineHeight: 1.6 }}>
              You don't have any loan applications yet. Check your real-time eligibility in seconds.
            </p>
            <button onClick={handleNewLoanClick} style={{ color: "#FFFCF7", background: "#C08B2D", padding: "12px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "15px", textDecoration: "none", border: "none", cursor: "pointer", display: "inline-block", boxShadow: "0 8px 20px rgba(192,139,45,0.25)" }}>
              Apply Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-stretch flex-1 overflow-hidden min-h-0">
            {/* Left Sidebar: Borrower Profile Card */}
            <div className="h-full overflow-y-auto pr-2 pb-16" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <div className="relative overflow-hidden h-max" style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "24px", padding: "32px", boxShadow: "0 20px 60px rgba(27,26,22,0.03)", color: "#1B1A16" }}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C08B2D] to-[#FFF1DA]" />
              
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#E2D2BE]">
                <div className="flex justify-between items-start">
                  <div style={{ width: "64px", height: "64px", borderRadius: "32px", background: "#FFF1DA", display: "flex", alignItems: "center", justifyItems: "center", fontSize: "24px", fontWeight: 800, color: "#C08B2D" }}>
                    <span style={{ margin: "auto" }}>{user?.name?.charAt(0)}</span>
                  </div>
                  {!isEditing && (
                    <button onClick={handleEditClick} style={{ fontSize: "13px", fontWeight: 600, color: "#C08B2D", background: "rgba(192,139,45,0.1)", padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-[rgba(192,139,45,0.2)]">
                      Edit Profile
                    </button>
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>{user?.name}</h2>
                  <p style={{ color: "#7B6E61", fontSize: "14px", marginTop: "2px" }}>{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <p style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>PAN Number</p>
                  <p style={{ fontSize: "16px", fontWeight: 600 }}>{displayPan}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Date of Birth</p>
                  <p style={{ fontSize: "16px", fontWeight: 600 }}>{displayDob ? new Date(displayDob).toLocaleDateString() : ""}</p>
                </div>

                {isEditing ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "12px", color: "#1B1A16", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Income</label>
                      <input 
                        type="number" 
                        value={editData.monthlyIncome} 
                        onChange={e => setEditData({...editData, monthlyIncome: e.target.value})}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E2D2BE", fontSize: "14px", outline: "none" }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "12px", color: "#1B1A16", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Employment</label>
                      <select 
                        value={editData.employmentMode} 
                        onChange={e => setEditData({...editData, employmentMode: e.target.value})}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E2D2BE", fontSize: "14px", outline: "none", background: "#FFFCF7" }}
                      >
                        <option value="SALARIED">Salaried</option>
                        <option value="SELF_EMPLOYED">Self Employed</option>
                        <option value="UNEMPLOYED">Unemployed</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "12px", color: "#1B1A16", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Update Salary Slip</label>
                      <label className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200" style={{ borderColor: editFile ? "#C08B2D" : "#E2D2BE", background: editFile ? "#FFF1DA" : "#FFFCF7" }}>
                        <input 
                          type="file" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={e => setEditFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: editFile ? "#C08B2D" : "#7B6E61" }}>
                          {editFile ? editFile.name : "+ Select new file"}
                        </span>
                      </label>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#F7F1E8", color: "#7B6E61", fontWeight: 600, fontSize: "14px" }}>Cancel</button>
                      <button onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#C08B2D", color: "#FFFCF7", fontWeight: 600, fontSize: "14px" }}>
                        {savingProfile ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Monthly Income</p>
                      <p style={{ fontSize: "16px", fontWeight: 600 }}>₹{displayIncome?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Employment</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, textTransform: "capitalize" }}>{displayEmp?.replace("_", " ")}</p>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-4">
                        <p style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>Documents</p>
                      </div>
                      <a href={displaySlip} target="_blank" rel="noreferrer" style={{ fontSize: "14px", fontWeight: 600, color: "#C08B2D", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none", background: "rgba(192,139,45,0.08)", padding: "12px 16px", borderRadius: "10px", border: "1px dashed rgba(192,139,45,0.3)" }} className="hover:bg-[rgba(192,139,45,0.15)] transition-colors">
                        View Salary Slip ↗
                      </a>
                    </div>
                  </>
                )}
              </div>
              </div>
            </div>

            {/* Right Area: Loan Applications */}
            <div className="h-full overflow-y-auto pr-4 pb-16" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <style dangerouslySetInnerHTML={{__html: `
                div::-webkit-scrollbar { display: none; }
              `}} />
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#F7F1E8] z-10 py-2">
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1B1A16", letterSpacing: "-0.5px" }}>Application History</h3>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#7B6E61", background: "#FFFCF7", padding: "4px 10px", borderRadius: "6px", border: "1px solid #E2D2BE" }}>{loans.length} Loans</span>
              </div>
              <div className="flex flex-col gap-8">
            {loans.map(loan => (
              <div key={loan._id} className="relative overflow-hidden group" style={{ background: "#FFFCF7", borderRadius: "24px", padding: "32px 40px", boxShadow: "0 20px 60px rgba(27,26,22,0.04)", border: "1px solid rgba(226, 210, 190, 0.4)" }}>
                
                {/* Subtle top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C08B2D] to-[#FFF1DA] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header: Amount + Status */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: loan.status === "CLOSED" ? "#2F6B4F" : "#C08B2D" }} />
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.1em" }}>Principal Amount</p>
                    </div>
                    <p style={{ fontSize: "42px", fontWeight: 800, color: "#1B1A16", letterSpacing: "-2px", lineHeight: 1 }}>₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                {/* Refined Details Row (No ugly box, just clean dividers) */}
                <div className="flex items-center justify-between py-6 border-y border-[#E2D2BE]/50 mb-8">
                  <div className="flex-1">
                    <p style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 500, marginBottom: "4px" }}>Tenure</p>
                    <p style={{ fontSize: "18px", color: "#1B1A16", fontWeight: 700, letterSpacing: "-0.5px" }}>{loan.tenure} <span style={{ fontSize: "14px", fontWeight: 500, color: "#7B6E61" }}>days</span></p>
                  </div>
                  <div className="w-[1px] h-[40px] bg-[#E2D2BE]/50" />
                  <div className="flex-1 px-8">
                    <p style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 500, marginBottom: "4px" }}>Est. Interest</p>
                    <p style={{ fontSize: "18px", color: "#1B1A16", fontWeight: 700, letterSpacing: "-0.5px" }}>₹{loan.simpleInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="w-[1px] h-[40px] bg-[#E2D2BE]/50" />
                  <div className="flex-1 text-right">
                    <p style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 500, marginBottom: "4px" }}>Total Payable</p>
                    <p style={{ fontSize: "18px", color: "#C08B2D", fontWeight: 800, letterSpacing: "-0.5px" }}>₹{loan.totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {loan.status === "REJECTED" && loan.rejectionReason && (
                  <div style={{ background: "#FDF0EE", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ background: "#FEE4E2", width: "32px", height: "32px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#B42318", fontWeight: "bold" }}>!</div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#B42318", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Rejection Note</p>
                      <p style={{ fontSize: "15px", color: "#991B1B", lineHeight: 1.5 }}>{loan.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-4">
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1B1A16", marginBottom: "20px" }}>Application Progress</p>
                  <div className="flex items-center justify-between relative px-2">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-8 right-8 h-[2px] -translate-y-1/2 z-0" style={{ background: "#EFE3D3" }} />
                    {/* Active Progress Line */}
                    <div 
                      className="absolute top-1/2 left-8 h-[2px] -translate-y-1/2 z-0 transition-all duration-1000" 
                      style={{ 
                        background: loan.status === "REJECTED" ? "#C2412B" : "#2F6B4F", 
                        width: loan.status === "CLOSED" ? "calc(100% - 64px)" : loan.status === "DISBURSED" ? "66%" : loan.status === "SANCTIONED" ? "33%" : "0%"
                      }} 
                    />
                    
                    <TimelineStep label="Applied" status="completed" />
                    <TimelineStep label="Sanctioned" status={loan.status === "REJECTED" ? "rejected" : loan.status === "SANCTIONED" || loan.status === "DISBURSED" || loan.status === "CLOSED" ? "completed" : loan.status === "APPLIED" ? "active" : "pending"} />
                    <TimelineStep label="Disbursed" status={loan.status === "REJECTED" ? "pending" : loan.status === "DISBURSED" || loan.status === "CLOSED" ? "completed" : loan.status === "SANCTIONED" ? "active" : "pending"} />
                    <TimelineStep label="Closed" status={loan.status === "CLOSED" ? "completed" : loan.status === "DISBURSED" ? "active" : "pending"} />
                  </div>
                </div>

                {/* Outstanding Balance Bar (only if disbursed/closed) */}
                {(loan.status === "DISBURSED" || loan.status === "CLOSED") && (
                  <div className="mt-10 pt-8" style={{ borderTop: "1px dashed rgba(226, 210, 190, 0.6)" }}>
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 500, marginBottom: "4px" }}>Amount Paid</p>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B1A16" }}>₹{loan.amountPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 500, marginBottom: "4px" }}>Remaining Balance</p>
                        <p style={{ fontSize: "24px", fontWeight: 800, color: "#C08B2D", letterSpacing: "-1px", lineHeight: 1 }}>
                          ₹{loan.outstandingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#EFE3D3", boxShadow: "inset 0 2px 4px rgba(27,26,22,0.05)" }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 relative overflow-hidden" 
                        style={{ 
                          background: loan.outstandingBalance === 0 ? "#2F6B4F" : "linear-gradient(90deg, #C08B2D, #E87A4D)", 
                          width: `${(loan.amountPaid / loan.totalRepayment) * 100}%` 
                        }} 
                      >
                        {/* Shimmer effect on the progress bar */}
                        {loan.outstandingBalance > 0 && loan.amountPaid > 0 && (
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -translate-x-full animate-[shimmer_2s_infinite]" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Loan Modal */}
      {isNewLoanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1A16]/40 backdrop-blur-md p-4">
          <div className="bg-[#FFFCF7] rounded-3xl p-8 max-w-[800px] w-full shadow-2xl relative border border-[#E2D2BE]">
            <button onClick={() => setIsNewLoanModalOpen(false)} className="absolute top-6 right-6 text-3xl font-light text-[#7B6E61] hover:text-[#1B1A16] bg-transparent border-none cursor-pointer">&times;</button>
            
            <div className="border-b border-[#E2D2BE] pb-4 mb-6">
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1B1A16", letterSpacing: "-0.5px" }}>Customize Your Loan</h2>
              <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "2px" }}>Adjust the sliders to see your repayment schedule instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Sliders */}
              <div className="flex flex-col gap-8 py-2">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end mb-1">
                    <label style={{ fontSize: "15px", fontWeight: 700, color: "#1B1A16" }}>Loan Amount</label>
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "#C08B2D", fontFamily: "monospace", letterSpacing: "-1.5px", lineHeight: 1 }}>₹{loanConfig.loanAmount.toLocaleString()}</span>
                  </div>
                  <input type="range" min={50000} max={500000} step={10000} value={loanConfig.loanAmount} onChange={e => setLoanConfig({...loanConfig, loanAmount: Number(e.target.value)})} className="w-full h-2 rounded-full appearance-none bg-[#E2D2BE] outline-none" style={{ accentColor: "#C08B2D" }} />
                  <div className="flex justify-between text-xs text-[#7B6E61] font-bold uppercase tracking-wider mt-1"><span>₹50,000</span><span>₹5,00,000</span></div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end mb-1">
                    <label style={{ fontSize: "15px", fontWeight: 700, color: "#1B1A16" }}>Tenure</label>
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "#C08B2D", fontFamily: "monospace", letterSpacing: "-1.5px", lineHeight: 1 }}>{loanConfig.tenure} days</span>
                  </div>
                  <input type="range" min={30} max={365} step={15} value={loanConfig.tenure} onChange={e => setLoanConfig({...loanConfig, tenure: Number(e.target.value)})} className="w-full h-2 rounded-full appearance-none bg-[#E2D2BE] outline-none" style={{ accentColor: "#C08B2D" }} />
                  <div className="flex justify-between text-xs text-[#7B6E61] font-bold uppercase tracking-wider mt-1"><span>30 days</span><span>365 days</span></div>
                </div>
              </div>

              {/* Calculation Summary */}
              <div style={{ background: "#FFF1DA", border: "1px solid #E2D2BE", borderRadius: "16px", padding: "24px", display: "flex", flexFlow: "column", justifyItems: "space-between" }} className="flex flex-col gap-4 justify-between">
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#C08B2D", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>Repayment Summary</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ color: "#7B6E61", fontWeight: 600, fontSize: "14px" }}>Interest Rate</span>
                    <span style={{ color: "#1B1A16", fontWeight: 700, fontFamily: "monospace", fontSize: "16px" }}>12% p.a.</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ color: "#7B6E61", fontWeight: 600, fontSize: "14px" }}>Est. Interest</span>
                    <span style={{ color: "#1B1A16", fontWeight: 700, fontFamily: "monospace", fontSize: "16px" }}>₹{simpleInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
                <div>
                  <div style={{ height: "1px", background: "rgba(226, 210, 190, 0.5)", marginBottom: "16px" }} />
                  <div className="flex justify-between items-end">
                    <span style={{ color: "#1B1A16", fontWeight: 700, fontSize: "16px" }}>Total Repayment</span>
                    <span style={{ color: "#C08B2D", fontWeight: 800, fontSize: "28px", fontFamily: "monospace", letterSpacing: "-1px", lineHeight: 1 }}>₹{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={handleApplyLoan} disabled={applyingLoan} style={{ background: applyingLoan ? "#E2D2BE" : "#C08B2D", color: applyingLoan ? "#7B6E61" : "#FFFCF7", borderRadius: "12px", fontSize: "16px", fontWeight: 700, padding: "14px 40px", border: "none", cursor: applyingLoan ? "not-allowed" : "pointer", transition: "all 150ms", boxShadow: applyingLoan ? "none" : "0 8px 20px rgba(192,139,45,0.25)" }}>
                {applyingLoan ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, color: string, text: string, border: string }> = {
    APPLIED: { bg: "#FEFCE8", color: "#A16207", text: "Processing", border: "#FEF08A" },
    SANCTIONED: { bg: "#F0FDF4", color: "#15803D", text: "Approved", border: "#BBF7D0" },
    DISBURSED: { bg: "#E6F1ED", color: "#1B6B5F", text: "Active", border: "#BFE3D9" },
    CLOSED: { bg: "#F0FDF4", color: "#2F6B4F", text: "Completed", border: "#BBF7D0" },
    REJECTED: { bg: "#FDF0EE", color: "#B42318", text: "Declined", border: "#F7B7A3" },
  };

  const style = styles[status] || styles.APPLIED;

  return (
    <div style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: "6px 16px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "3px", background: style.color }} />
      <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {style.text}
      </span>
    </div>
  );
}

function TimelineStep({ label, status }: { label: string, status: "completed" | "active" | "pending" | "rejected" }) {
  const getStyles = () => {
    switch(status) {
      case "completed": return { bg: "#2F6B4F", border: "#2F6B4F", text: "#FFFCF7", icon: "✓" };
      case "rejected": return { bg: "#C2412B", border: "#C2412B", text: "#FFFCF7", icon: "×" };
      case "active": return { bg: "#FFFCF7", border: "#C08B2D", text: "#C08B2D", icon: "●" };
      default: return { bg: "#FFFCF7", border: "#E2D2BE", text: "#E2D2BE", icon: "" };
    }
  };

  const style = getStyles();

  return (
    <div className="flex flex-col items-center gap-3 z-10 w-24">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500"
        style={{
          background: style.bg,
          border: `2px solid ${style.border}`,
          color: style.text,
          boxShadow: status === "active" ? "0 0 0 4px rgba(192,139,45,0.1)" : "0 2px 4px rgba(27,26,22,0.05)"
        }}
      >
        {style.icon}
      </div>
      <span 
        style={{ 
          fontSize: "12px", 
          fontWeight: status === "pending" ? 500 : 700, 
          color: status === "pending" ? "#7B6E61" : "#1B1A16",
          textAlign: "center"
        }}
      >
        {label}
      </span>
    </div>
  );
}

