"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMe, logout, getLeads } from "@/lib/api";

export default function SalesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "SALES") {
        router.push("/login");
        return;
      }
      setUser(res.data.user);
      fetchLeads();
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  async function fetchLeads() {
    try {
      const res = await getLeads();
      setLeads(res.data.leads);
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
            Sales Portal
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
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1B1A16", letterSpacing: "-0.5px" }}>Borrower Leads</h1>
            <p style={{ fontSize: "15px", color: "#7B6E61", marginTop: "4px" }}>Users who have registered but not yet applied for a loan.</p>
          </div>
          <div style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "8px", padding: "8px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#7B6E61", fontWeight: 600 }}>Total Leads</span>
            <span style={{ fontSize: "18px", color: "#1B1A16", fontWeight: 700 }}>{leads.length}</span>
          </div>
        </div>

        <div style={{ background: "#FFFCF7", border: "1px solid #E2D2BE", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(27,26,22,0.03)" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: "#F7F1E8", borderBottom: "1px solid #E2D2BE" }}>
                <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 600, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>User Name</th>
                <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 600, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</th>
                <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 600, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registered On</th>
                <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 600, color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#7B6E61" }}>
                    No leads available right now.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} style={{ borderBottom: "1px solid #E2D2BE", transition: "background 150ms" }} className="hover:bg-[#FFF1DA]">
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#1B1A16" }}>{lead.name}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#7B6E61" }}>{lead.email}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#7B6E61" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button 
                        style={{ 
                          background: "#FFFCF7", border: "1px solid #E2D2BE", color: "#1B1A16", 
                          padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(27,26,22,0.02)"
                        }}
                      >
                        Contact Lead
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

