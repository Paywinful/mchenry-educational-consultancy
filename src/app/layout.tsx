import type { Metadata } from "next";
import "./globals.css";
import { montserrat } from "@/components/fonts";
import LoadingScreenClient from "@/components/LoadingScreenClient";

export const metadata: Metadata = {
  title: "McHenry Educational Consultancy",
  description: "Your partner in educational excellence",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans">
        <LoadingScreenClient />
        {children}
      </body>
    </html>
  );
}
