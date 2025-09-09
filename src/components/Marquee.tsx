"use client";

import { useEffect, useRef } from "react";

export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let offset = 0;
    let raf = 0;
    const step = () => {
      offset -= 0.5;
      el.style.transform = `translateX(${offset}px)`;
      if (Math.abs(offset) > el.scrollWidth / 2) offset = 0;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white">
      <div className="flex whitespace-nowrap py-3" ref={ref}>
        {[...items, ...items].map((it, i) => (
          <span key={i} className="mx-4 text-sm text-gray-600">{it}</span>
        ))}
      </div>
    </div>
  );
}


