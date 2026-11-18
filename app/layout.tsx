import type { Metadata, Viewport } from "next";
import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Set the theme class before paint to avoid a flash (key matches lib/theme.tsx).
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('myvillage.theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const kumbh = Kumbh_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kumbh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Village — Give away children's items",
  description:
    "A warm community exchange for passing on reusable children's clothes, shoes, and toys.",
};

export const viewport: Viewport = {
  themeColor: "#f8f7f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={kumbh.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-surface-100 text-ink">
        {/* Mobile-first: single column, centered on a neutral backdrop on larger screens. */}
        <div className="min-h-screen w-full bg-surface-300/40">
          <div className="relative mx-auto flex min-h-screen w-full max-w-content flex-col bg-surface-100 shadow-md">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
