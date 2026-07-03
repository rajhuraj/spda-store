# SPDA Store — Setup Guide (Supabase + Vercel, dono FREE)

Ye ek real website hai — product ka link paste karoge, photo/naam khud aa jayega,
price + apni affiliate link daaloge, "Buy Now" button seedha waha jayega. Admin
panel **OTP se protected hai** (koi password nahi — email pe code aayega).

---

## STEP 1 — Supabase Project Banao (Database)

1. [supabase.com](https://supabase.com) pe jao → **Sign up** (GitHub se ho sakta hai)
2. **"New Project"** → naam do "spda-store" → **strong database password set karo** (isse yaad rakhna, sirf ek baar chahiye)
3. Region: **Mumbai (ap-south-1)** select karo (India ke liye sabse fast)
4. Project banne me 1-2 minute lagega

### Database table banao
1. Left sidebar → **SQL Editor** → **New Query**
2. `supabase/migrations/0001_init.sql` file kholo, poora content copy karo
3. Yahan paste karke **Run** click karo — "products" table ban jayega

### Email OTP login on karo
1. Left sidebar → **Authentication** → **Providers**
2. **Email** provider already on hota hai — bas confirm kar lo enabled hai
3. **Authentication** → **Settings** me "Enable email confirmations" ON rakho

### API Keys copy karo
1. Left sidebar → **Project Settings** (gear icon) → **API**
2. **Project URL** aur **anon public key** — dono copy kar lo, aage chahiye honge

---

## STEP 2 — Edge Function Deploy Karo (link se photo/naam kheenchne wala)

Ye step thoda technical hai — Supabase CLI chahiye. Agar kisi dost/developer ki help
mil jaye to 5 minute ka kaam hai:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase functions deploy fetch-product-meta --no-verify-jwt
```

`YOUR_PROJECT_ID` Project Settings → General me milega.

> Agar ye step skip bhi karo, to baaki website chalegi — bas "Fetch" button kaam nahi
> karega, aur tumhe naam/photo manually daalna padega (jo bilkul theek hai, thoda extra
> kaam bas).

---

## STEP 3 — Vercel Pe Website Deploy Karo (FREE)

1. Is project ko apne GitHub repo me upload karo
2. [vercel.com](https://vercel.com) pe jao → GitHub se sign up
3. **"Add New Project"** → apna repo select karo → **Import**
4. Deploy karne se pehle **Environment Variables** add karo:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Step 1 se copy kiya URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Step 1 se copy kiya anon key |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | tumhara email (sirf isi pe OTP login hoga) |

5. **Deploy** click karo — 1-2 minute me live link mil jayega
   (jaise `spda-store.vercel.app`)

---

## Use Kaise Karoge

- **Store dikhane ke liye:** `https://your-app.vercel.app` — yahi link Instagram bio me daalo
- **Product add karne ke liye:** `https://your-app.vercel.app/admin`
  1. Apna email daalo → "OTP Bhejo"
  2. Email me aaya 6-digit code daalo → Login
  3. Product ka Amazon/Flipkart link paste karke "Fetch" karo — naam/photo aa jayega
  4. Price check/edit karo, apni **EarnKaro affiliate link** daalo
  5. "Product Save Karo" — turant store pe live ho jayega

---

## Zaroori Baatein

- **Price hamesha auto nahi aayega** — Amazon/Flipkart bot-requests block karte hain.
  Photo/naam zyadatar aa jayega, price khud confirm/edit karna padega.
- **OTP kisi ko mat batana** — jo bhi email `NEXT_PUBLIC_ADMIN_EMAIL` me daala hai,
  sirf usi email pe login ho payega, koi aur try karega to allowed nahi hoga.
- Free tier limits: Supabase free = 500MB database + 2GB bandwidth/month,
  Vercel free = kaafi zyada — ek chhoti store ke liye bahut hai.
