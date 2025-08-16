import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    // Regular weight with backup formats
    {
      path: "../public/fonts/Satoshi-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    // Italic variants with backup formats
    {
      path: "../public/fonts/Satoshi-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-satoshi",
})

export const metadata: Metadata = {
  title: "lucascur/github-bio",
  description: "A dynamic, customizable image generator for GitHub repositories.",
  icons: [
    { rel: 'icon', type: 'image/webp', url: '/favicon.webp' },
    { rel: 'icon', type: 'image/png', url: '/favicon.png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${satoshi.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
