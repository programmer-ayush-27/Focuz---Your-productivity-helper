
import type { Metadata } from "next";
import { Londrina_Solid } from "next/font/google";
import "./globals.css";

const londrina = Londrina_Solid({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "🌸 Focuz",
  description: "Focuz is a simple, distraction-free productivity timer designed to help you manage your time and stay focused. Choose between Focus, Short Break, and Long Break sessions, customize your background, and create a peaceful space for getting things done.",
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
