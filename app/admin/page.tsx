"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage("Email ya password galat hai.");
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
          Login karo.
        </p>

        <form onSubmit={handleLogin}>
          <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="apna email daalo"
            style={{ margin: "6px 0 16px" }}
          />

          <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{ margin: "6px 0 16px" }}
          />

          <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Login ho raha hai..." : "Login Karo"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontSize: "0.85rem", color: "var(--gold-light)" }}>{message}</p>
        )}
      </div>
    </main>
  );
}
