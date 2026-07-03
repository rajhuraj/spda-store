"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (ADMIN_EMAIL && email.trim().toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase()) {
      setMessage("Ye email admin ke liye allowed nahi hai.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setStep("otp");
      setMessage("Email pe 6-digit code bheja gaya hai — check karo (spam folder bhi).");
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);
    if (error) {
      setMessage("Code galat ya expire ho gaya. Dobara try karo.");
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 380, width: "100%", padding: 28 }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 6 }}>SPDA Store — Admin</h1>
        <p style={{ opacity: 0.6, fontSize: "0.88rem", marginBottom: 20 }}>
          Password nahi — sirf email pe aane wale OTP se login hoga.
        </p>

        {step === "email" && (
          <form onSubmit={sendOtp}>
            <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>Admin Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              style={{ margin: "6px 0 16px" }}
            />
            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Bhej rahe hain..." : "OTP Bhejo"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>6-Digit Code</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              style={{ margin: "6px 0 16px", letterSpacing: 4, textAlign: "center", fontSize: "1.2rem" }}
            />
            <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Verify ho raha hai..." : "Login Karo"}
            </button>
          </form>
        )}

        {message && (
          <p style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--gold-light)" }}>{message}</p>
        )}
      </div>
    </main>
  );
}
