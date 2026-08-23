import { useEffect, useRef, useState } from "react";

export function useCountUp(value: number) {
  const [count, setCount] = useState(value);
  const countRef = useRef(count);
  useEffect(() => { const start = countRef.current; const delta = value - start; if (!delta) return; const started = performance.now(); const timer = window.setInterval(() => { const progress = Math.min(1, (performance.now() - started) / 300); const next = Math.round(start + delta * progress); countRef.current = next; setCount(next); if (progress === 1) window.clearInterval(timer); }, 16); return () => window.clearInterval(timer); }, [value]);
  return count;
}