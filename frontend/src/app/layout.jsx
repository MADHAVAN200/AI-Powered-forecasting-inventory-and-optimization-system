import { Inter } from "next/font/google";
import "./globals.css";
import { UniversalHeader } from "@/components/universal-header";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
    title: "Walmart OptiFresh",
    description: "AI-powered fresh food inventory management system with blockchain verification",
    icons: {
        icon: "/favicon.png",
    },
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <UniversalHeader />
        {children}
      </body>
    </html>);
}
