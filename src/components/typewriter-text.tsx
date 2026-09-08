"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  words: string[];
}

export function TypewriterText({ words }: TypewriterTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
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
    <span className="inline-block min-w-[180px] text-left text-primary">
      {text}
      <span className="animate-pulse font-light opacity-70">|</span>
    </span>
  );
}
