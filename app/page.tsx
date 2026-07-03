"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState<Product | null>(null);

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

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          borderBottom: "1px solid rgba(200,149,42,0.2)",
        }}
      >
        <span style={{ fontSize: 18 }}>⭐</span>
        <span style={{ fontFamily: "Oswald, sans-serif", letterSpacing: 1, fontSize: "1.05rem" }}>
          SPDA <span style={{ color: "var(--gold-light)" }}>Store</span>
        </span>
      </div>

      {/* BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #2a3312 0%, #3d4a1e 60%, #4a5a20 100%)",
          padding: "30px 20px 26px",
          textAlign: "center",
          borderBottom: "2px solid rgba(200,149,42,0.3)",
        }}
      >
        <h1 style={{ fontSize: "clamp(1.4rem,2.8vw,1.9rem)", letterSpacing: "1px", margin: 0 }}>
          Training <span style={{ color: "var(--gold-light)" }}>Gear</span> Store
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: "0.9rem" }}>
          Yahi gear hum recommend karte hain — apna kit select karo
        </p>
      </div>

      {/* CATEGORY FILTER */}
      {categories.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "16px 20px 4px",
            overflowX: "auto",
            maxWidth: 1100,
            margin: "0 auto",
            position: "sticky",
            top: 0,
            background: "var(--olive-dark)",
            zIndex: 10,
          }}
        >
          <Chip label="Sabhi" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {categories.map((cat) => (
            <Chip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 20,
          padding: "20px 20px 70px",
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
          <ProductCard key={p.id} product={p} onOpen={() => setSelected(p)} />
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "1fr",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Band karo"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.5)",
                border: "none",
                color: "white",
                width: 34,
                height: 34,
                borderRadius: "50%",
                fontSize: 18,
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              ✕
            </button>

            <div
              style={{
                aspectRatio: "16/10",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.image_url}
                  alt={selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <span style={{ opacity: 0.3 }}>No photo</span>
              )}
            </div>

            <div style={{ padding: "22px 26px 28px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--gold-light)", fontWeight: 700, letterSpacing: 0.5 }}>
                {selected.category}
              </div>
              <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.5rem", margin: "6px 0 14px" }}>
                {selected.name}
              </h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 22 }}>
                <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.8rem", color: "var(--gold-light)" }}>
                  {selected.price}
                </span>
                {selected.mrp && (
                  <span style={{ fontSize: "1rem", opacity: 0.4, textDecoration: "line-through" }}>
                    {selected.mrp}
                  </span>
                )}
              </div>
              <a
                href={selected.affiliate_link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn"
                style={{ display: "block", textAlign: "center", fontSize: "1.05rem", padding: "14px" }}
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        overflow: "hidden",
        cursor: "pointer",
        transform: hover ? "translateY(-4px)" : "none",
        borderColor: hover ? "var(--gold)" : undefined,
        boxShadow: hover ? "0 10px 26px rgba(0,0,0,0.35)" : "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
    >
      <div
        style={{
          aspectRatio: "1",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hover ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.25s ease",
            }}
          />
        ) : (
          <span style={{ opacity: 0.3, fontSize: 12 }}>No photo</span>
        )}
      </div>
      <div style={{ padding: "13px 15px 16px" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--gold-light)", fontWeight: 700, letterSpacing: 0.3 }}>
          {product.category}
        </div>
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "1rem",
            margin: "4px 0 10px",
            lineHeight: 1.25,
            minHeight: "2.4em",
          }}
        >
          {product.name}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.15rem", color: "var(--gold-light)" }}>
            {product.price}
          </span>
          {product.mrp && (
            <span style={{ fontSize: "0.8rem", opacity: 0.4, textDecoration: "line-through" }}>
              {product.mrp}
            </span>
          )}
        </div>
        <a
          href={product.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={(e) => e.stopPropagation()}
          className="btn"
          style={{ display: "block", fontSize: "0.9rem", padding: "9px" }}
        >
          Buy Now
        </a>
      </div>
    </div>
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
