import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Playfair_Display, Syne, Instrument_Serif } from "next/font/google";
import { ModeProvider } from "@/components/mode/ModeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Randel Serafica — Full-Stack Developer & Startup Founder",
  description:
    "Full-stack developer and startup founder — I build products, lead the teams behind them, and make sure both scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${syne.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <ModeProvider>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
        </ModeProvider>
      </body>
    </html>
  );
}
