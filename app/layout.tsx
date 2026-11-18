
import type { Metadata } from "next";
import { Londrina_Solid } from "next/font/google";
import "./globals.css";

const londrina = Londrina_Solid({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Website",
  description: "My Next.js Website",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${londrina.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
