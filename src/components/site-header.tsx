"use client";

import { useEffect, useRef } from "react";

/**
 * Sticky header stack (promo banner + navbar + the text-tool tabs).
 *
 * Its height changes when the banner is dismissed or the second-level tabs
 * appear, so it is published as --site-header-h for anything that sticks below
 * it. Watched three ways because each alone misses a case: the observer can be
 * throttled while the tab is not compositing, a window resize reflows the rows,
 * and the banner mounts (or unmounts) after the first paint.
 */
export function SiteHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let last = -1;
    const publish = () => {
      const height = el.offsetHeight;
      if (height === last) return;
      last = height;
      document.documentElement.style.setProperty("--site-header-h", `${height}px`);
    };
    publish();

    const resizeObserver = new ResizeObserver(publish);
    resizeObserver.observe(el);
    const mutationObserver = new MutationObserver(publish);
    mutationObserver.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    window.addEventListener("resize", publish);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, []);

  return (
    <div ref={ref} className="sticky top-0 z-50">
      {children}
    </div>
  );
}
