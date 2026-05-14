import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans" style={{ background: "#F7F1E8" }}>
      {/* Navigation */}
      <nav className="w-full px-6 py-6 lg:px-12 flex justify-between items-center z-50">
        <div style={{ color: "#1B1A16", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.05em" }}>
          Cred<span style={{ color: "#C08B2D" }}>Sync</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login"
            style={{ color: "#1B1A16", fontWeight: 600, padding: "10px 20px", textDecoration: "none", transition: "opacity 0.2s" }}
            className="hover:opacity-70"
          >
            Sign In
          </Link>
          <Link 
            href="/register"
            style={{ background: "#1B1A16", color: "#FFFCF7", padding: "10px 24px", borderRadius: "10px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(27,26,22,0.1)", transition: "transform 0.2s" }}
            className="hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center max-w-[1400px] w-full mx-auto px-6 lg:px-12 relative h-full">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
          <h1 style={{ color: "#1B1A16", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Smarter Loans, <br />
            <span style={{ color: "#C08B2D" }}>Faster Approvals.</span>
          </h1>
          <p style={{ color: "#7B6E61", fontSize: "1.25rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto lg:mx-0" }}>
            End-to-end loan management software built for modern financial institutions. Handle originations, sanctions, disbursements, and collections in one unified platform.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              href="/register"
              style={{ background: "#C08B2D", color: "#FFFCF7", padding: "16px 36px", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 24px rgba(192,139,45,0.25)", transition: "all 0.2s" }}
              className="hover:shadow-[0_12px_32px_rgba(192,139,45,0.3)] hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              Start Borrowing Now
            </Link>
            <Link 
              href="/login"
              style={{ background: "#FFFCF7", color: "#1B1A16", border: "1px solid #E2D2BE", padding: "16px 36px", borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
              className="hover:bg-[#FFF1DA] hover:border-[#C08B2D] w-full sm:w-auto text-center"
            >
              Staff Login
            </Link>
          </div>
        </div>

        {/* Right Content - Abstract UI Mockup */}
        <div className="flex-1 w-full relative max-w-[600px] hidden md:block z-10 perspective-1000">
          <div 
            style={{ 
              background: "#FFFCF7", 
              borderRadius: "24px", 
              padding: "32px", 
              boxShadow: "0 24px 64px rgba(27,26,22,0.08)", 
              border: "1px solid #E2D2BE",
              transform: "rotateY(-5deg) rotateX(5deg)",
              transformStyle: "preserve-3d"
            }}
          >
            <div className="flex justify-between items-center mb-8 border-b border-[#E2D2BE] pb-6">
              <div>
                <div style={{ width: "120px", height: "16px", background: "#EFE3D3", borderRadius: "8px", marginBottom: "8px" }} />
                <div style={{ width: "200px", height: "32px", background: "#1B1A16", borderRadius: "8px" }} />
              </div>
              <div style={{ width: "48px", height: "48px", background: "#FFF1DA", borderRadius: "24px" }} />
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl" style={{ background: i === 1 ? "#FFF1DA" : "#F7F1E8", border: i === 1 ? "1px solid #C08B2D" : "1px solid transparent" }}>
                  <div className="flex items-center gap-4">
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: i === 1 ? "#C08B2D" : "#E2D2BE" }} />
                    <div>
                      <div style={{ width: "100px", height: "14px", background: i === 1 ? "#1B1A16" : "#7B6E61", borderRadius: "4px", marginBottom: "6px" }} />
                      <div style={{ width: "60px", height: "10px", background: i === 1 ? "#C08B2D" : "#D4C5B5", borderRadius: "4px", opacity: 0.7 }} />
                    </div>
                  </div>
                  <div style={{ width: "80px", height: "24px", background: i === 1 ? "#FFFCF7" : "#E2D2BE", borderRadius: "6px" }} />
                </div>
              ))}
            </div>
            
            {/* Floating Element */}
            <div 
              className="absolute -right-12 -bottom-12"
              style={{ 
                background: "#1B1A16", color: "#FFFCF7", padding: "24px", borderRadius: "20px", 
                boxShadow: "0 16px 32px rgba(27,26,22,0.2)", width: "240px",
                transform: "translateZ(50px)"
              }}
            >
              <div style={{ fontSize: "12px", color: "#7B6E61", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Funds Disbursed</div>
              <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: "monospace", color: "#FFFCF7" }}>₹2,75,000</div>
              <div style={{ height: "4px", background: "#333", borderRadius: "2px", marginTop: "16px", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "#2F6B4F" }} />
              </div>
            </div>
          </div>
          
          {/* Decorative background blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#FFF1DA] to-transparent rounded-full blur-3xl -z-10 opacity-60" />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-[#E2D2BE] mt-auto">
        <p style={{ color: "#7B6E61", fontSize: "14px", fontWeight: 500 }}>
          © {new Date().getFullYear()} CredSync Inc. Modern Lending Systems.
        </p>
      </footer>
    </div>
  );
}

