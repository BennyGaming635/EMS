import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMS Operations Hub",
  description:
    "Responsive emergency, vehicle, and 911 call management dashboard built with Next.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
