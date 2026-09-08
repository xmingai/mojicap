import { cn } from "@/lib/utils";

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
  className?: string;
}

export function FAQSection({ title, faqs, className }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  // Generate FAQPage JSON-LD schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section className={cn("mt-16 mb-8 w-full max-w-4xl mx-auto", className)}>
      <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details 
            key={idx} 
            className="group rounded-xl border border-border/50 bg-background/50 overflow-hidden open:bg-muted/30 transition-colors"
          >
            <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-lg leading-tight select-none list-none marker:hidden [&::-webkit-details-marker]:hidden hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {faq.q}
              <span className="ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </span>
            </summary>
            
            <div className="px-5 pb-5 pt-0 text-muted-foreground leading-relaxed animate-in slide-in-from-top-1 fade-in-50 duration-200">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
