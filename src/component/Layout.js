'use client';
import { FaBars } from "react-icons/fa6";
import { FiEdit } from 'react-icons/fi';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Layout({ children, showHeader = false, logoPosition = 'center' }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col px-4 pt-6 relative pb-10 overflow-hidden">
      {/* Header (visible in NextScreen) */}
      {showHeader && (
        <motion.div
          initial={{ y: -68, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 h-[68px] bg-[#523230] flex items-center justify-between px-4 z-20"
        >
          <div className="w-10 h-10 bg-[#ffe5b4] rounded-full flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Hadith Logo"
              width={32}
              height={32}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white p-2 rounded-md">
              <FiEdit className="w-5 h-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-md">
              <FaBars className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Logo (visible in FrontScreen) */}
      {logoPosition === 'center' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-16 mb-6 flex justify-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center shadow-md">
            <Image
              src="/logo.svg"
              alt="Hadith Logo"
              width={32}
              height={32}
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

// export const metadata = {
//   title: 'Islamic Hadith App',
//   description: 'Bukhari Hadith Collection',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body style={{ margin: 0, padding: 0 }}>{children}</body>
//     </html>
//   )
// }