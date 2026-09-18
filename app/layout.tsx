import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import CameraSentinel from "@/components/CameraSentinel";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-schibsted",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hire-perfect-prod.vercel.app"),
  title: {
    default: "HirePerfect — Proctored online assessments with AI integrity checks",
    template: "%s | HirePerfect",
  },
  description: "Run and take proctored MCQ assessments across 20 categories. Identity checks, browser lockdown, AI monitoring and a reviewable integrity report for every attempt.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "HirePerfect",
    title: "HirePerfect — Proctored online assessments with AI integrity checks",
    description: "Run and take proctored MCQ assessments across 20 categories. Identity checks, browser lockdown, AI monitoring and a reviewable integrity report for every attempt.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HirePerfect — Proctored online assessments with AI integrity checks",
    description: "Run and take proctored MCQ assessments across 20 categories. Identity checks, browser lockdown, AI monitoring and a reviewable integrity report for every attempt.",
  },
  other: {
    "color-scheme": "light",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F9FC",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }} className={`${schibsted.variable} ${ibmPlexSans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                ['theme', 'color-mode', 'ui-theme', 'dark-mode'].forEach(function(k) {
                  localStorage.removeItem(k);
                  sessionStorage.removeItem(k);
                });
                document.documentElement.classList.remove('dark');
                document.documentElement.removeAttribute('data-theme');
                document.documentElement.style.colorScheme = 'light';
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-paper text-ink font-sans antialiased min-h-screen flex flex-col selection:bg-signal-soft selection:text-signal">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-btn"
        >
          Skip to content
        </a>
        <CameraSentinel />
        {children}
      </body>
    </html>
  );
}
