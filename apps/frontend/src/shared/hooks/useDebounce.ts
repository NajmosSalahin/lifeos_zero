import { useState, useEffect } from 'react';
export const useDebounce = <T>(value: T, delay = 300): T => {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return dv;
};
