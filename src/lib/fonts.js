import { Inter, Poppins } from 'next/font/google';
import { Cairo } from 'next/font/google';

export const arabicFont = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});