import "@/styles/globals.css"
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(
          "flex flex-col min-h-screen h-screen max-h-screen font-sans antialiased",
          fontSans.variable
        )} data-tauri-drag-region>
        <div className="h-8" data-tauri-drag-region> </div>
        {children}
      </body>
    </html>
  );
}

