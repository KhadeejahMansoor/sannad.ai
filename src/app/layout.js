// app/layout.js
import './globals.css';
import { inter } from '../lib/fonts';
import { LanguageProvider } from '../lib/LanguageContext';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Hadith App',
  description: 'Hadith Translator App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F6F4F1] min-h-screen`}>
        {/* Holds the current language ('en' | 'ar') for the whole app.
            Defaults to 'en'; the choice persists in localStorage. */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}