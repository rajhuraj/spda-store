// ============================================================
//  fetch-product-meta
//  Product ka URL leke uska title, photo, aur (agar mile to)
//  price nikalta hai — Open Graph meta tags se.
//
//  NOTE: Amazon/Flipkart jaise bade sites kabhi-kabhi bot
//  requests block kar dete hain — is wajah se price hamesha
//  nahi milega. Isliye admin panel me price ka field manual
//  bhi rakha hai, taaki wahan khud confirm/edit kar sako.
// ============================================================

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match) return match[1];
  }
  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL chahiye" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Site se data nahi mila (status ${res.status}). Photo/naam manually daal do.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();

    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      extractTitleTag(html);

    const image =
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image") ||
      extractMeta(html, "twitter:image:src");

    // Price OG tags kai sites (jaise Shopify stores) pe milte hain,
    // Amazon/Flipkart pe zyadatar nahi — is liye null bhi aa sakta hai,
    // frontend wahan manual field dikhayega.
    const price =
      extractMeta(html, "product:price:amount") ||
      extractMeta(html, "og:price:amount");

    return new Response(
      JSON.stringify({
        title: title || null,
        image: image || null,
        price: price || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Kuch galat hua, photo/naam manually daal do." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
