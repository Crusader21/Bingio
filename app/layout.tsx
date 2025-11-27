import "./global.css";
import React from "react";

export const metadata = {
  title: "Chat with Bingio",
  description: "Emotion-aware movie & series recommendations — BINGIO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
