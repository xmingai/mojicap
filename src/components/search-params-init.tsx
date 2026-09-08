"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SearchParamsInitProps {
  onParams: (params: URLSearchParams) => void;
}

function SearchParamsReader({ onParams }: SearchParamsInitProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);

  return null;
}

/**
 * Reports the current URL query string to the parent once it is known on the client.
 *
 * useSearchParams() forces client-side rendering up to the nearest Suspense
 * boundary on statically rendered pages, so it is isolated here: the page that
 * uses it stays fully server-rendered (important for the emoji grid's SEO).
 */
export function SearchParamsInit(props: SearchParamsInitProps) {
  return (
    <Suspense fallback={null}>
      <SearchParamsReader {...props} />
    </Suspense>
  );
}
