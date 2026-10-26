import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meowmory — Every cat has a story",
  description: "Discover and document cats on an interactive map.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
