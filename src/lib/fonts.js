import { Inter, Noto_Sans_Arabic } from 'next/font/google';

/* Each font declares a `variable`, so the family can be composed into a real
 * CSS stack. next/font generates a HASHED family name (__Inter_a1b2c3), which
 * is why `font-family: 'Inter', 'Noto Sans Arabic'` in globals.css never
 * matched the Inter being loaded here — the literal name doesn't exist. The
 * variable is the only reliable handle on it.
 *
 * Cairo and Poppins used to be exported from this file too, but nothing
 * imported them: layout.js applies only `inter.variable` and
 * `notoArabic.variable`. They were four extra weight files fetched on every
 * page load for no rendering benefit.
 */

/* `display: 'swap'` paints text in the fallback font immediately and swaps
 * when the webfont lands. The default ('optional' via next/font) holds text
 * invisible for a short block period, which showed as a blank moment
 * followed by everything appearing at once.
 *
 * `adjustFontFallback` (on by default) generates a fallback with matched
 * metrics, so the swap doesn't shift the layout — text appears sooner and
 * doesn't move when the real font arrives.
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

/* Loaded so U+FDFA (ﷺ) and any stray Arabic have a real font to fall back to
 * on the Latin side. Inter carries no Arabic glyphs at all, so without this
 * the browser substitutes whatever the OS happens to have — a different
 * design and a different baseline on every machine.
 *
 * 500 dropped: the site uses this at 400 for body Arabic and 700 where it
 * needs weight, and an unused weight is a whole extra file.
 */
export const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-arabic',
});