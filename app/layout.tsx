import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Mosianedi",
  description: "Road investment modeling platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* no bg/text classes here, they come from globals.css via vars */}
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}