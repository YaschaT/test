import { useState } from 'react';

interface GrammarMascotImageProps {
  size: number;
  className?: string;
}

const PRIMARY_SRC = '/assets/dashboard/mascots/mascot-grammar.png';
const FALLBACK_SRC = '/assets/dashboard/mascots/mascot-greeting.png';

/**
 * The Kotobox blue/purple bird, scoped to every Grammar surface (path indicator, overview hero, lesson
 * hero) — never the unrelated fox illustration used elsewhere. Tries the Grammar-specific pose first;
 * falls back to the existing greeting pose until `mascot-grammar.png` is added, so dropping that file in
 * later needs no code change and never shows a broken-image icon in the meantime.
 */
export function GrammarMascotImage({ size, className = '' }: GrammarMascotImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? FALLBACK_SRC : PRIMARY_SRC}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
