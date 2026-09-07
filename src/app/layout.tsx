import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SentimentIQ — AI Conversation Analyzer",
  description:
    "Upload conversation transcripts and get deep AI-powered sentiment analysis, emotion detection, and actionable KPIs.",
  keywords: "sentiment analysis, AI, conversation analysis, emotion detection, NLP",
  openGraph: {
    title: "SentimentIQ — AI Conversation Analyzer",
    description: "Deep sentiment insights powered by Google Gemini AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
