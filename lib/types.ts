export type Product = {
  id: string;
  name: string;
  category: string;
  price: string | null;
  mrp: string | null;
  image_url: string | null;
  images: string[];
  affiliate_link: string;
  source_url: string | null;
  created_at: string;
};
