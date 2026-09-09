"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  words: string[];
}

export function TypewriterText({ words }: TypewriterTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  // Start on the full first word so the server-rendered <h1> is a complete
  // sentence for crawlers; the animation then deletes it and cycles on.
  const [text, setText] = useState(() => words?.[0] ?? "");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[wordIndex] || words[0];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (text === "") {
        // Finished deleting: pause, then advance to the next word.
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }, 500);
      } else {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 50);
      }
    } else if (text === currentWord) {
      // Fully typed: hold, then start deleting.
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else {
      timeout = setTimeout(() => setText(currentWord.slice(0, text.length + 1)), 100);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    // The caret is a CSS pseudo-element, not text, so it never becomes part of
    // the heading that search engines and screen readers read.
    <span className="inline-block min-w-[180px] text-left text-primary after:animate-pulse after:font-light after:opacity-70 after:content-['|']">
      {text}
    </span>
  );
}
