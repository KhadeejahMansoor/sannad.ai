import { Inter, Poppins, Cairo, Noto_Sans_Arabic } from 'next/font/google';

// Each font also declares a `variable`, so the family can be composed into a
// real CSS stack. next/font generates a HASHED family name (__Inter_a1b2c3),
// which is why `font-family: 'Inter', 'Noto Sans Arabic'` in globals.css never
// matched the Inter being loaded here — the literal name doesn't exist. The
// variable is the only reliable handle on it.
export const arabicFont = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
});

// Loaded so U+FDFA (ﷺ) and any stray Arabic have a real font to fall back to on
// the Latin side. Inter carries no Arabic glyphs at all, so without this the
// browser substitutes whatever the OS happens to have — a different design and
// a different baseline on every machine.
export const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-arabic',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});