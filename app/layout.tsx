import "./globals.css";
import { JetBrains_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display"
});

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Flamingo Flight - Odds Game",
  description: "Modern flamingo flight odds game demo UI with live flight simulation."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${orbitron.variable} ${jetBrains.variable} bg-midnight-900 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
