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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main>
      {/* TOP BAR */}
      <div className="topbar">
        <span style={{ fontSize: 18 }}>⭐</span>
        <span style={{ fontFamily: "Oswald, sans-serif", letterSpacing: 1, fontSize: "1.05rem" }}>
          SPDA <span style={{ color: "var(--gold-light)" }}>Store</span>
        </span>
        <span className="topbar-tagline">Training gear — seedha kharido</span>
      </div>

      {/* CATEGORY FILTER */}
      {categories.length > 0 && (
        <div className="filter-row">
          <Chip label="Sabhi" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {categories.map((cat) => (
            <Chip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {/* GRID */}
      <div className="products-grid">
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

      {/* DETAIL MODAL — floating window, solid (not see-through) */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(200, 149, 42, 0.2);
        }
        .topbar-tagline {
          margin-left: auto;
          font-size: 0.8rem;
          opacity: 0.5;
          display: none;
        }
        .filter-row {
          display: flex;
          gap: 8px;
          padding: 14px 16px 4px;
          overflow-x: auto;
          max-width: 1100px;
          margin: 0 auto;
          position: sticky;
          top: 0;
          background: var(--olive-dark);
          z-index: 10;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 16px 16px 60px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 540px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 18px 20px 60px; }
          .topbar-tagline { display: inline; }
          .filter-row { padding: 16px 20px 4px; }
        }
        @media (min-width: 768px) {
          .products-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px 24px 70px; }
        }
        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </main>
  );
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const gallery = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="modal-card card">
        <button onClick={onClose} aria-label="Band karo" className="modal-close">
          ✕
        </button>

        <div className="modal-photo">
          {gallery.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gallery[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ opacity: 0.3 }}>No photo</span>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="modal-thumbs">
            {gallery.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                alt=""
                onClick={() => setActiveImg(i)}
                className={`thumb ${i === activeImg ? "thumb-active" : ""}`}
              />
            ))}
          </div>
        )}

        <div style={{ padding: "18px 22px 26px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--gold-light)", fontWeight: 700, letterSpacing: 0.5 }}>
            {product.category}
          </div>
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.35rem", margin: "6px 0 14px" }}>
            {product.name}
          </h2>
          {product.price && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.6rem", color: "var(--gold-light)" }}>
                {product.price}
              </span>
              {product.mrp && (
                <span style={{ fontSize: "0.95rem", opacity: 0.4, textDecoration: "line-through" }}>
                  {product.mrp}
                </span>
              )}
            </div>
          )}
          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn"
            style={{ display: "block", textAlign: "center", fontSize: "1.05rem", padding: "14px", marginTop: product.price ? 0 : 16 }}
          >
            Buy Now
          </a>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 12, 6, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 100;
        }
        .modal-card {
          max-width: 480px;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .modal-photo {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
        }
        .modal-thumbs {
          display: flex;
          gap: 8px;
          padding: 10px 22px 0;
          overflow-x: auto;
        }
        .thumb {
          width: 46px;
          height: 46px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.6;
          flex-shrink: 0;
        }
        .thumb-active {
          border-color: var(--gold);
          opacity: 1;
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.55);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const cover = product.images?.[0] || product.image_url;
  return (
    <div className="p-card card" onClick={onOpen}>
      <div className="p-photo">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product.name} className="p-img" />
        ) : (
          <span style={{ opacity: 0.3, fontSize: 12 }}>No photo</span>
        )}
      </div>
      <div style={{ padding: "11px 12px 14px" }}>
        <div style={{ fontSize: "0.68rem", color: "var(--gold-light)", fontWeight: 700, letterSpacing: 0.3 }}>
          {product.category}
        </div>
        <div className="p-name">{product.name}</div>
        {product.price && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.02rem", color: "var(--gold-light)" }}>
              {product.price}
            </span>
            {product.mrp && (
              <span style={{ fontSize: "0.72rem", opacity: 0.4, textDecoration: "line-through" }}>
                {product.mrp}
              </span>
            )}
          </div>
        )}
        <a
          href={product.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={(e) => e.stopPropagation()}
          className="btn"
          style={{ display: "block", fontSize: "0.84rem", padding: "8px", marginTop: product.price ? 0 : 10 }}
        >
          Buy Now
        </a>
      </div>
      <style jsx>{`
        .p-card {
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .p-photo {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .p-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s ease;
        }
        .p-name {
          font-family: "Oswald", sans-serif;
          font-size: 0.92rem;
          margin: 4px 0 8px;
          line-height: 1.25;
          min-height: 2.3em;
        }
        @media (hover: hover) {
          .p-card:hover { transform: translateY(-4px); border-color: var(--gold); box-shadow: 0 10px 26px rgba(0,0,0,0.35); }
          .p-card:hover .p-img { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
