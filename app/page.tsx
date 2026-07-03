"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setProducts(data as Product[]);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      {/* BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #2a3312 0%, #3d4a1e 60%, #4a5a20 100%)",
          padding: "48px 20px 40px",
          textAlign: "center",
          borderBottom: "2px solid rgba(200,149,42,0.3)",
        }}
      >
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "2px", margin: 0 }}>
          Training <span style={{ color: "var(--gold-light)" }}>Gear</span> Store
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 8 }}>
          Yahi gear hum recommend karte hain — apna kit select karo
        </p>
      </div>

      {/* CATEGORY FILTER */}
      {categories.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "18px 16px 4px",
            overflowX: "auto",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <Chip
            label="Sabhi"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 18,
          padding: "20px 20px 60px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {loading && <p style={{ opacity: 0.6 }}>Loading...</p>}

        {!loading && filtered.length === 0 && (
          <p style={{ opacity: 0.6, gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>
            Jald hi products add honge
          </p>
        )}

        {filtered.map((p) => (
          <div key={p.id} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                aspectRatio: "1",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ opacity: 0.3, fontSize: 12 }}>No photo</span>
              )}
            </div>
            <div style={{ padding: "12px 14px 16px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--gold-light)", fontWeight: 700 }}>
                {p.category}
              </div>
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: "1rem", margin: "4px 0 10px" }}>
                {p.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.15rem", color: "var(--gold-light)" }}>
                  {p.price}
                </span>
                {p.mrp && (
                  <span style={{ fontSize: "0.8rem", opacity: 0.4, textDecoration: "line-through" }}>
                    {p.mrp}
                  </span>
                )}
              </div>
              <a
                href={p.affiliate_link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn"
                style={{ display: "block" }}
              >
                Buy Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--gold)" : "rgba(255,255,255,0.07)",
        color: active ? "var(--olive-dark)" : "rgba(255,255,255,0.7)",
        border: "1px solid rgba(200,149,42,0.3)",
        borderRadius: 30,
        padding: "7px 16px",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
