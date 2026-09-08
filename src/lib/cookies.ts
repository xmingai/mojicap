/** Browser cookie helpers. Kept in a module so the side effect is out of component render. */
export function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAgeSeconds};samesite=lax`;
}
