"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
        <a href="https://rajhuraj.github.io/spdaetah/index.html" className="topbar-link">
          🏠 Academy Website
        </a>
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
        .topbar-link {
          margin-left: auto;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--gold-light);
          background: rgba(200, 149, 42, 0.12);
          border: 1px solid rgba(200, 149, 42, 0.4);
          border-radius: 30px;
          padding: 6px 12px;
          text-decoration: none;
          white-space: nowrap;
        }
        @media (hover: hover) {
          .topbar-link:hover { background: rgba(200, 149, 42, 0.22); }
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
      <div onClick={(e) => e.stopPropagation()} className="modal-card">
        <button onClick={onClose} aria-label="Band karo" className="modal-close">
          ✕
        </button>

        <div className="modal-scroll">
          <div className="modal-photo">
            {gallery.length > 0 ? (
              <Image
                src={gallery[activeImg]}
                alt={product.name}
                fill
                sizes="(max-width: 540px) 100vw, 480px"
                style={{ objectFit: "contain" }}
                unoptimized={!gallery[activeImg].startsWith("http")}
              />
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

          <div style={{ padding: "18px 22px 4px" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--gold-light)", fontWeight: 700, letterSpacing: 0.5 }}>
              {product.category}
            </div>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.35rem", margin: "6px 0 0" }}>
              {product.name}
            </h2>
          </div>
        </div>

        {/* Price + Buy — hamesha fully visible rehta hai, scroll me nahi chhupta */}
        <div className="modal-footer">
          {product.price && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: "Oswald, sans-serif", fontSize: "1.5rem", color: "var(--gold-light)" }}>
                {product.price}
              </span>
              {product.mrp && (
                <span style={{ fontSize: "0.9rem", opacity: 0.4, textDecoration: "line-through" }}>
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
            style={{ display: "block", textAlign: "center", fontSize: "1.05rem", padding: "14px" }}
          >
            Buy Now
          </a>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: #0a0c06;
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
          border-radius: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--olive-dark);
          border: 1.5px solid rgba(200, 149, 42, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }
        .modal-scroll {
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        .modal-footer {
          padding: 14px 22px 20px;
          background: var(--olive-dark);
          border-top: 1px solid rgba(200, 149, 42, 0.2);
          flex-shrink: 0;
        }
        .modal-photo {
          aspect-ratio: 1;
          background: #f4f1ea;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
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
          <div className="p-photo-inner">
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width: 540px) 45vw, (max-width: 1024px) 25vw, 200px"
              className="p-img"
              unoptimized={!cover.startsWith("http")}
            />
          </div>
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
          background: #f4f1ea;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .p-photo-inner {
          position: absolute;
          inset: 10px;
        }
        .p-img {
          object-fit: contain;
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
