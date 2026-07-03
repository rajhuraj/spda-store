import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPDA Store",
  description: "SPDA ke recommended training gear — seedha kharido.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
