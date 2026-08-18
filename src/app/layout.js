// app/layout.js
import './globals.css';
import { inter, notoArabic, serif } from '../lib/fonts';
import { LanguageProvider } from '../lib/LanguageContext';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Sannad',
  description: 'Sannad — hadith search and translation',
  icons: {
    icon: '/favicon.svg',
  },
  // Proves ownership of the domain to Google Search Console. Next renders this
  // as <meta name="google-site-verification"> in the head of every page.
  // Removing it un-verifies the property, so it stays even after the check
  // passes.
  verification: {
    google: 'GVo_JDbw9GyOkk0g5BtegBuynELVzAgdGBKfIpjKmx4',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoArabic.variable} ${serif.variable}`}
    >
      <body className="bg-[#F6F4F1] min-h-screen">
        {/* Holds the current language ('en' | 'ar') for the whole app.
            Defaults to 'en'; the choice persists in localStorage. */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}