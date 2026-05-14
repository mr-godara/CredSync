"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex" style={{ background: "#F7F1E8" }}>
      {/* Left Side - Branding (Hidden on mobile) */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, #EFE3D3 0%, #F7F1E8 100%)",
          borderRight: "1px solid #E2D2BE"
        }}
      >
        {/* Decorative background elements */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply opacity-20"
          style={{ background: "#C08B2D", filter: "blur(100px)" }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply opacity-20"
          style={{ background: "#8E5A22", filter: "blur(100px)" }}
        />

        <div className="absolute top-12 left-12 z-10">
          <Link href="/" style={{ color: "#C08B2D", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.5px", textDecoration: "none" }}>
            CredSync
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 style={{ color: "#1B1A16", fontSize: "40px", fontWeight: 700, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-1px" }}>
            Start your journey to financial freedom.
          </h1>
          <p style={{ color: "#7B6E61", fontSize: "18px", lineHeight: 1.5 }}>
            Join thousands of borrowers who have successfully funded their dreams through our seamless, transparent lending platform.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full border-2 border-[#F7F1E8]"
                  style={{ background: i % 2 === 0 ? "#C08B2D" : "#7B6E61" }}
                />
              ))}
            </div>
            <p style={{ color: "#1B1A16", fontSize: "14px", fontWeight: 500 }}>
              Join 10,000+ users
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" style={{ color: "#C08B2D", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.5px", textDecoration: "none" }}>
              CredSync
            </Link>
          </div>

          <div
            style={{
              background: "#FFFCF7",
              border: "1px solid #E2D2BE",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(27,26,22,0.06)",
            }}
            className="w-full px-8 py-8 sm:px-10 sm:py-10"
          >
            <div className="mb-6">
              <h2 style={{ color: "#1B1A16", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.4px" }}>
                Create an account
              </h2>
              <p style={{ color: "#7B6E61", fontSize: "15px", marginTop: "4px" }}>
                Enter your details to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#1B1A16" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="John Doe"
                  style={{
                    background: "#F7F1E8",
                    border: "1px solid #E2D2BE",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#1B1A16",
                    outline: "none",
                    transition: "all 150ms",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#C08B2D";
                    e.target.style.boxShadow = "0 0 0 3px rgba(192,139,45,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#E2D2BE";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#1B1A16" }}>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@example.com"
                  style={{
                    background: "#F7F1E8",
                    border: "1px solid #E2D2BE",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#1B1A16",
                    outline: "none",
                    transition: "all 150ms",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#C08B2D";
                    e.target.style.boxShadow = "0 0 0 3px rgba(192,139,45,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#E2D2BE";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#1B1A16" }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={change}
                  placeholder="••••••••"
                  style={{
                    background: "#F7F1E8",
                    border: "1px solid #E2D2BE",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#1B1A16",
                    outline: "none",
                    transition: "all 150ms",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#C08B2D";
                    e.target.style.boxShadow = "0 0 0 3px rgba(192,139,45,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#E2D2BE";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#1B1A16" }}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={change}
                  placeholder="••••••••"
                  style={{
                    background: "#F7F1E8",
                    border: "1px solid #E2D2BE",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    color: "#1B1A16",
                    outline: "none",
                    transition: "all 150ms",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#C08B2D";
                    e.target.style.boxShadow = "0 0 0 3px rgba(192,139,45,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#E2D2BE";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "#E2D2BE" : "#C08B2D",
                  color: loading ? "#7B6E61" : "#FFFCF7",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 150ms",
                  marginTop: "4px",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(192,139,45,0.2)",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#A77424"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#C08B2D"; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={e   => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#7B6E61", marginTop: "24px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#C08B2D", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

