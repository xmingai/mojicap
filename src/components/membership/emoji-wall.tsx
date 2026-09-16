/**
 * Decorative left panel for the paywall dialogs: a slowly drifting wall of the
 * emoji people come here to copy, so the moment we ask for something the dialog
 * still looks like MojiCap rather than a form. Purely visual — hidden from
 * assistive tech, hidden on small screens, and still under reduced motion.
 */

const COLUMNS = [
  ["😂", "❤️", "🥹", "✨", "🔥", "🫶", "😭", "🌸", "💀", "🎉"],
  ["🥰", "👀", "🙏", "💖", "😎", "🌈", "🫠", "🍓", "⭐", "🤍"],
  ["🦋", "😊", "💫", "🐱", "🤭", "🎀", "☕", "💯", "😍", "🍀"],
  ["🌙", "🥳", "💜", "🤩", "🌷", "😇", "🍒", "🫧", "🙈", "💐"],
];

export function EmojiWall() {
  return (
    <div aria-hidden="true" className="relative hidden overflow-hidden bg-muted/50 md:block">
      <div className="absolute inset-0 grid grid-cols-4 gap-2.5 px-5">
        {COLUMNS.map((column, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 motion-safe:animate-[emoji-wall_42s_linear_infinite]"
            // Neighbouring columns drift in opposite directions, and start offset,
            // so the wall never lines up into rows.
            style={{ animationDirection: i % 2 ? "reverse" : "normal", marginTop: `${(i % 2) * -24}px` }}
          >
            {[...column, ...column].map((emoji, j) => (
              <span
                key={j}
                className="grid aspect-square place-items-center rounded-xl bg-background/60 text-2xl ring-1 ring-border/30"
              >
                {emoji}
              </span>
            ))}
          </div>
        ))}
      </div>
      {/* Fade the wall into the card on the right, and soften the top and bottom edges. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-card" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}
