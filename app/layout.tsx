import "./globals.css";

export const metadata = {
  title: "Bingio",
  description: "Emotion-aware movie & series recommendation assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0B0C] text-white antialiased h-screen">
        <div className="flex flex-col h-full w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
