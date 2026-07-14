"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [sourceUrl, setSourceUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/admin");
      } else {
        setChecking(false);
        loadProducts();
      }
    });
  }, [router]);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  }

  async function handleFetchMeta() {
    if (!sourceUrl.trim()) return;
    setFetching(true);
    setFetchMsg("");

    try {
      const res = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(sourceUrl.trim())}&palette=false`
      );
      const json = await res.json();

      if (json.status !== "success") {
        setFetchMsg("Is link se data nahi mila — naam/photo manually daal do.");
        setFetching(false);
        return;
      }

      const d = json.data;
      if (d.title) setName(d.title);
      const fetchedImg = d.image?.url || d.logo?.url;
      if (fetchedImg) {
        setImages((prev) => {
          const copy = [...prev];
          copy[0] = fetchedImg;
          return copy;
        });
      }

      setFetchMsg(
        fetchedImg
          ? "Naam aur photo mil gaye ✅ — price khud check karke daal do (wo automatically nahi milta). Aur photos neeche 'Aur Photo Add Karo' se daal sakte ho."
          : "Naam mil gaya, photo nahi mili — image URL manually daal do."
      );
    } catch (err) {
      setFetchMsg("Kuch galat hua — naam/photo manually daal do.");
    }
    setFetching(false);
  }

  function resetForm() {
    setEditingId(null);
    setSourceUrl("");
    setName("");
    setCategory("General");
    setPrice("");
    setMrp("");
    setImages([""]);
    setAffiliateLink("");
    setFetchMsg("");
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setSourceUrl(p.source_url || "");
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price || "");
    setMrp(p.mrp || "");
    setImages(p.images?.length ? p.images : p.image_url ? [p.image_url] : [""]);
    setAffiliateLink(p.affiliate_link);
    setFetchMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateImageAt(index: number, value: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  }
  function addImageField() {
    setImages((prev) => [...prev, ""]);
  }
  function removeImageField(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }
  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !affiliateLink) {
      alert("Naam aur affiliate link zaroori hai.");
      return;
    }
    setSaving(true);

    const cleanImages = images.map((i) => i.trim()).filter(Boolean);

    const payload = {
      name,
      category: category || "General",
      price: price || null,
      mrp: mrp || null,
      images: cleanImages,
      image_url: cleanImages[0] || null,
      affiliate_link: affiliateLink,
      source_url: sourceUrl || null,
    };

    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (error) {
      alert("Save nahi hua: " + error.message);
      return;
    }

    resetForm();
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Ye product delete karna hai?")) return;
    await supabase.from("products").delete().eq("id", id);
    if (editingId === id) resetForm();
    loadProducts();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  if (checking) return null;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "30px 20px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>SPDA Store — Admin</h1>
        <button className="btn-outline btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* ADD / EDIT PRODUCT */}
      <div className="card" style={{ padding: 22, marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>
            {editingId ? "Product Edit Karo" : "Naya Product Add Karo"}
          </h2>
          {editingId && (
            <button type="button" className="btn-outline btn" onClick={resetForm} style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
              Cancel
            </button>
          )}
        </div>

        <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>Product ka link (Amazon/Flipkart)</label>
        <div style={{ display: "flex", gap: 8, margin: "6px 0 16px" }}>
          <input
            className="input"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://www.amazon.in/product-link"
          />
          <button type="button" className="btn" onClick={handleFetchMeta} disabled={fetching}>
            {fetching ? "..." : "Fetch"}
          </button>
        </div>
        {fetchMsg && (
          <p style={{ fontSize: "0.82rem", color: "var(--gold-light)", marginTop: -10, marginBottom: 16 }}>
            {fetchMsg}
          </p>
        )}

        <form onSubmit={handleSave}>
          <Field label="Product Naam *">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>

          <Field label="Category">
            <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Field label="Price (optional)">
                <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹599 — chhod bhi sakte ho" />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="MRP (optional)">
                <input className="input" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="₹999" />
              </Field>
            </div>
          </div>

          <Field label="Photos (pehli photo cover/main photo banegi)">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      className="btn-outline btn"
                      style={{ padding: "2px 8px", fontSize: "0.7rem", lineHeight: 1.4, opacity: i === 0 ? 0.3 : 1 }}
                      title="Upar le jao"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === images.length - 1}
                      className="btn-outline btn"
                      style={{ padding: "2px 8px", fontSize: "0.7rem", lineHeight: 1.4, opacity: i === images.length - 1 ? 0.3 : 1 }}
                      title="Neeche le jao"
                    >
                      ▼
                    </button>
                  </div>
                  <span style={{ fontSize: "0.75rem", opacity: 0.5, width: 16, flexShrink: 0 }}>{i + 1}</span>
                  <input
                    className="input"
                    value={img}
                    onChange={(e) => updateImageAt(i, e.target.value)}
                    placeholder={`Photo ${i + 1} ka URL`}
                  />
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: i === 0 ? "2px solid var(--gold)" : "none" }} />
                  )}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(i)}
                      className="btn-outline btn"
                      style={{ padding: "6px 10px", flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImageField} className="btn-outline btn" style={{ alignSelf: "flex-start", fontSize: "0.82rem", padding: "6px 12px" }}>
                + Aur Photo Add Karo
              </button>
            </div>
          </Field>

          <Field label="Tumhari Affiliate Link (Buy button yahan jayega) *">
            <input
              className="input"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              required
              placeholder="https://earnkaro.com/..."
            />
          </Field>

          <button className="btn" type="submit" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? "Save ho raha hai..." : editingId ? "Update Karo" : "Product Save Karo"}
          </button>
        </form>
      </div>

      {/* EXISTING PRODUCTS */}
      <h2 style={{ fontSize: "1.1rem" }}>Existing Products ({products.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((p) => {
          const cover = p.images?.[0] || p.image_url;
          return (
            <div
              key={p.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 12,
                borderColor: editingId === p.id ? "var(--gold)" : undefined,
              }}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={p.name} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
              ) : (
                <div style={{ width: 50, height: 50, background: "rgba(255,255,255,0.08)", borderRadius: 6 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: "0.82rem", opacity: 0.6 }}>
                  {p.category} {p.price ? `· ${p.price}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn-outline btn" onClick={() => startEdit(p)} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                  Edit
                </button>
                <button
                  className="btn-outline btn"
                  onClick={() => handleDelete(p.id)}
                  style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "6px 12px", fontSize: "0.85rem" }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: "0.85rem", opacity: 0.8, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
