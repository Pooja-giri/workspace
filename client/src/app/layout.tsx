import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/store/providers";

export const metadata: Metadata = {
  title: "WorkSphere",
  description: "Enterprise HR & Workforce Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}