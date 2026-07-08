import { useState } from 'react';

interface ListeningMascotImageProps {
  size: number;
  className?: string;
}

const PRIMARY_SRC = '/assets/dashboard/mascots/mascot-listening.png';
const FALLBACK_SRC = '/assets/dashboard/mascots/mascot-greeting.png';

/**
 * The Kotobox blue/purple bird, scoped to Listening — same fallback-chain pattern as
 * `GrammarMascotImage`: tries the Listening-specific pose first, falls back to the existing greeting
 * pose until `mascot-listening.png` is added, so dropping that file in later needs no code change and
 * never shows a broken-image icon in the meantime.
 */
export function ListeningMascotImage({ size, className = '' }: ListeningMascotImageProps) {
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
