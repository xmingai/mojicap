/* Google Analytics gtag.js type declarations */

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: string | number;
  content_type?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Window {
  gtag?: (
    command: "event" | "config" | "set",
    targetOrAction: string,
    params?: GtagEventParams | Record<string, unknown>
  ) => void;
}
