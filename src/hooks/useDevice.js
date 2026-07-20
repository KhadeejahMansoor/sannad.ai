/* hooks/useDesktop.js – new version */
import { useEffect, useState } from 'react';

export default function useDesktop(breakpoint = 768) {
  // ➜ compute once, right before first paint on the client
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > breakpoint : false,
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isDesktop;
}
