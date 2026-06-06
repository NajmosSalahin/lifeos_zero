import { useState, useEffect } from 'react';
export const useMediaQuery = (q: string) => {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const h = (e: MediaQueryListEvent) => setM(e.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, [q]);
  return m;
};
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
