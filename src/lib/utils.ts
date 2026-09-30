import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Emoji names are stored lower-case ("coat"); a title, heading or list entry starts with a capital. */
export function capitalize(name: string, locale: string): string {
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1)
}
