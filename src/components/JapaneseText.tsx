import type { FuriganaSegment } from '../types';

interface JapaneseTextProps {
  segments: FuriganaSegment[];
  showFurigana?: boolean;
  className?: string;
}

/** Renders Japanese text with native <ruby>/<rt> furigana — real semantic HTML, not an image or fake overlay. */
export function JapaneseText({ segments, showFurigana = true, className }: JapaneseTextProps) {
  return (
    <span className={`jp-text ${className ?? ''}`}>
      {segments.map((seg, i) =>
        seg.reading && showFurigana ? (
          <ruby key={i}>
            {seg.text}
            <rt>{seg.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}
