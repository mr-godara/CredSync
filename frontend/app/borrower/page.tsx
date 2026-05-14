"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getMe, logout, savePersonalDetails, uploadSalarySlip, applyLoan } from "@/lib/api";

export default function BorrowerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(2); // Step 1 is Registration, so we start at 2
  
  // Step 2 Form
  const [personalDetails, setPersonalDetails] = useState({
    pan: "",
    dob: "",
    monthlyIncome: "",
    employmentMode: "SALARIED",
  });

  // Step 3 Form
  const [file, setFile] = useState<File | null>(null);

  // Step 4 Form
  const [loanConfig, setLoanConfig] = useState({
    loanAmount: 100000,
    tenure: 180,
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Load User Data
  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "BORROWER") {
        router.push("/login");
        return;
      }

      setUser(res.data.user);
      
      // Determine what step the user should be on based on their profile data
      if (res.data.user.pan) {
        if (res.data.user.salarySlipUrl) {
          setStep(4);
        } else {
          setStep(3);
        }
      }
      setPageLoading(false);
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  // Handle Step 2 Submission (BRE)
  async function submitStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!personalDetails.pan || !personalDetails.dob || !personalDetails.monthlyIncome) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await savePersonalDetails({
        pan: personalDetails.pan.toUpperCase(),
        dob: personalDetails.dob,
        monthlyIncome: Number(personalDetails.monthlyIncome),
        employmentMode: personalDetails.employmentMode,
      });
      toast.success("Personal details saved. You are eligible!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.reason || err?.response?.data?.message || "Validation failed.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Step 3 Submission (Upload)
  async function submitStep3(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    setLoading(true);
    try {
      await uploadSalarySlip(file);
      toast.success("Salary slip uploaded successfully.");
      setStep(4);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Step 4 Submission (Apply)
  async function submitStep4(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await applyLoan({ loanAmount: loanConfig.loanAmount, tenure: loanConfig.tenure });
      toast.success("Loan application submitted successfully!");
      router.push("/borrower/my-loans");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply for loan.");
    } finally {
      setLoading(false);
    }
  }

  // Calculated Interest for Step 4 UI
  const interestRate = 12; // 12% p.a.
  const simpleInterest = (loanConfig.loanAmount * interestRate * loanConfig.tenure) / (100 * 365);
  const totalRepayment = loanConfig.loanAmount + simpleInterest;

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F1E8" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#FFFCF7", borderBottom: "1px solid #E2D2BE", padding: "16px 32px" }} className="flex justify-between items-center sticky top-0 z-50">
        <Link href="/" style={{ color: "#C08B2D", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
          CredSync
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/borrower/my-loans" style={{ color: "#7B6E61", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            My Loans
          </Link>
          <div className="flex items-center gap-3 border-l border-[#E2D2BE] pl-6">
            <span style={{ color: "#1B1A16", fontSize: "14px", fontWeight: 600 }}>{user?.name}</span>
            <button 
              onClick={handleLogout}
              style={{ fontSize: "13px", color: "#B42318", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1080px] mx-auto px-6 py-6 flex flex-col items-center">
        
        {/* Step Indicator - Wider layout */}
        <div className="w-full max-w-[800px] flex items-center justify-between mb-6 relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[2px] -z-10" style={{ background: "#E2D2BE", transform: "translateY(-50%)" }} />
          <div className="absolute top-1/2 left-4 h-[2px] -z-10 transition-all duration-500" style={{ background: "#C08B2D", width: `calc(${((step - 1) / 3) * 100}% - 32px)`, transform: "translateY(-50%)" }} />
          
          {[1, 2, 3, 4].map((s) => {
            const isCompleted = s < step || (s === 1); 
            const isActive = s === step;
            return (
              <div key={s} className="flex flex-col items-center gap-3" style={{ background: "#F7F1E8", padding: "0 16px" }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                  style={{
                    background: isCompleted || isActive ? "#C08B2D" : "#FFFCF7",
                    border: isCompleted || isActive ? "2px solid #C08B2D" : "2px solid #E2D2BE",
                    color: isCompleted || isActive ? "#FFFCF7" : "#7B6E61",
                    boxShadow: isActive ? "0 0 0 4px rgba(192,139,45,0.15)" : "none"
                  }}
                >
                  {isCompleted ? "✓" : s}
                </div>
                <span style={{ fontSize: "13px", fontWeight: isActive ? 700 : 600, color: isActive ? "#1B1A16" : "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s === 1 ? "Account" : s === 2 ? "Profile" : s === 3 ? "Documents" : "Apply"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Container - Wider & Gridded */}
        <div className="w-full" style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "20px", padding: "32px 48px", boxShadow: "0 12px 40px rgba(27,26,22,0.04)" }}>
          
          {step === 2 && (
            <form onSubmit={submitStep2} className="flex flex-col gap-6">
              <div className="border-b border-[#E2D2BE] pb-4 mb-2">
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1B1A16", letterSpacing: "-0.5px" }}>Personal Details</h2>
                <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "2px" }}>We need these details to run a real-time eligibility check.</p>
              </div>

              {/* 3 Column Grid to utilize width */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1B1A16" }}>PAN Number</label>
                  <input required type="text" placeholder="ABCDE1234F" style={inputStyle} value={personalDetails.pan} onChange={e => setPersonalDetails({...personalDetails, pan: e.target.value.toUpperCase()})} maxLength={10} />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1B1A16" }}>Date of Birth</label>
                  <input required type="date" style={inputStyle} value={personalDetails.dob} onChange={e => setPersonalDetails({...personalDetails, dob: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: "14px", fontWeight: 600, color: "#1B1A16" }}>Monthly Income (₹)</label>
                  <input required type="number" placeholder="50000" style={inputStyle} value={personalDetails.monthlyIncome} onChange={e => setPersonalDetails({...personalDetails, monthlyIncome: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label style={{ fontSize: "14px", fontWeight: 600, color: "#1B1A16" }}>Employment Mode</label>
                <div className="grid grid-cols-3 gap-4">
                  {["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"].map((mode) => (
                    <button
                      key={mode} type="button"
                      onClick={() => setPersonalDetails({...personalDetails, employmentMode: mode})}
                      style={{
                        padding: "16px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
                        border: personalDetails.employmentMode === mode ? "2px solid #C08B2D" : "2px solid #E2D2BE",
                        background: personalDetails.employmentMode === mode ? "#FFF1DA" : "#FFFCF7",
                        color: personalDetails.employmentMode === mode ? "#C08B2D" : "#7B6E61",
                        transition: "all 150ms"
                      }}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="submit" disabled={loading} style={{ ...btnStyle(loading), width: "auto", padding: "16px 40px" }}>
                  {loading ? "Checking Eligibility..." : "Save & Continue →"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={submitStep3} className="flex flex-col gap-6">
              <div className="border-b border-[#E2D2BE] pb-4 mb-2">
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1B1A16", letterSpacing: "-0.5px" }}>Verify Income</h2>
                <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "2px" }}>Upload your latest salary slip. Maximum file size is 5MB.</p>
              </div>

              <div 
                className="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 hover:bg-[#FFF1DA]"
                style={{ borderColor: file ? "#C08B2D" : "#E2D2BE", background: file ? "#FFF1DA" : "transparent" }}
              >
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center gap-4">
                  <div style={{ width: 64, height: 64, borderRadius: 32, background: file ? "#C08B2D" : "#EFE3D3", color: file ? "#FFF" : "#C08B2D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", transition: "all 200ms" }}>
                    {file ? "✓" : "↑"}
                  </div>
                  <div>
                    <p style={{ color: "#1B1A16", fontWeight: 700, fontSize: "18px" }}>{file ? file.name : "Click or drag file here"}</p>
                    <p style={{ color: "#7B6E61", fontSize: "15px", marginTop: "6px" }}>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB uploaded successfully` : "Supports PDF, JPG, PNG up to 5MB"}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button type="button" onClick={() => setStep(2)} style={{ color: "#7B6E61", fontWeight: 600, fontSize: "16px", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...btnStyle(loading), width: "auto", padding: "16px 40px" }}>
                  {loading ? "Uploading..." : "Upload & Continue →"}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={submitStep4} className="flex flex-col gap-6">
              <div className="border-b border-[#E2D2BE] pb-4 mb-2">
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1B1A16", letterSpacing: "-0.5px" }}>Customize Your Loan</h2>
                <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "2px" }}>Adjust the sliders to see your repayment schedule instantly.</p>
              </div>

              {/* 2 Column Layout inside the card for Step 4 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Side: Sliders */}
                <div className="flex flex-col gap-6 py-2">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end mb-1">
                      <label style={{ fontSize: "16px", fontWeight: 600, color: "#1B1A16" }}>Loan Amount</label>
                      <span style={{ fontSize: "28px", fontWeight: 700, color: "#C08B2D", fontFamily: "monospace", letterSpacing: "-1px" }}>₹{loanConfig.loanAmount.toLocaleString()}</span>
                    </div>
                    <input type="range" min={50000} max={500000} step={10000} value={loanConfig.loanAmount} onChange={e => setLoanConfig({...loanConfig, loanAmount: Number(e.target.value)})} className="w-full h-2 rounded-full appearance-none bg-[#E2D2BE] outline-none" style={{ accentColor: "#C08B2D" }} />
                    <div className="flex justify-between text-sm text-[#7B6E61] font-medium mt-1"><span>₹50,000</span><span>₹5,00,000</span></div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end mb-1">
                      <label style={{ fontSize: "16px", fontWeight: 600, color: "#1B1A16" }}>Tenure</label>
                      <span style={{ fontSize: "28px", fontWeight: 700, color: "#C08B2D", fontFamily: "monospace", letterSpacing: "-1px" }}>{loanConfig.tenure} days</span>
                    </div>
                    <input type="range" min={30} max={365} step={15} value={loanConfig.tenure} onChange={e => setLoanConfig({...loanConfig, tenure: Number(e.target.value)})} className="w-full h-2 rounded-full appearance-none bg-[#E2D2BE] outline-none" style={{ accentColor: "#C08B2D" }} />
                    <div className="flex justify-between text-sm text-[#7B6E61] font-medium mt-1"><span>30 days</span><span>365 days</span></div>
                  </div>
                </div>

                {/* Right Side: Calculation Summary */}
                <div style={{ background: "#FFF1DA", border: "1px solid #E2D2BE", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="flex flex-col gap-4">
                  <div>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#C08B2D", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Repayment Summary</h3>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ color: "#7B6E61", fontWeight: 600, fontSize: "14px" }}>Interest Rate</span>
                      <span style={{ color: "#1B1A16", fontWeight: 700, fontFamily: "monospace", fontSize: "15px" }}>12% p.a.</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ color: "#7B6E61", fontWeight: 600, fontSize: "14px" }}>Simple Interest</span>
                      <span style={{ color: "#1B1A16", fontWeight: 700, fontFamily: "monospace", fontSize: "15px" }}>₹{simpleInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ height: "1px", background: "#E2D2BE", marginBottom: "16px" }} />
                    <div className="flex justify-between items-end">
                      <span style={{ color: "#1B1A16", fontWeight: 700, fontSize: "16px" }}>Total Repayment</span>
                      <span style={{ color: "#C08B2D", fontWeight: 800, fontSize: "26px", fontFamily: "monospace", letterSpacing: "-1px", lineHeight: 1 }}>₹{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E2D2BE]">
                <button type="button" onClick={() => setStep(3)} style={{ color: "#7B6E61", fontWeight: 600, fontSize: "15px", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...btnStyle(loading), width: "auto", padding: "12px 40px", marginTop: 0 }}>
                  {loading ? "Applying..." : "Submit Application →"}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}

// Shared Styles for Inputs & Buttons
const inputStyle: React.CSSProperties = {
  background: "#F7F1E8", border: "1px solid #E2D2BE", borderRadius: "10px", padding: "14px 16px", fontSize: "15px", color: "#1B1A16", outline: "none", transition: "all 150ms",
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  background: loading ? "#E2D2BE" : "#C08B2D", color: loading ? "#7B6E61" : "#FFFCF7", borderRadius: "10px", fontSize: "16px", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 150ms", boxShadow: loading ? "none" : "0 4px 12px rgba(192,139,45,0.2)"
});

