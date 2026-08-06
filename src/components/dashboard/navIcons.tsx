/**
 * The sidebar's navigation icons.
 *
 * Eight of them are the supplied illustrated assets (Dashboard-redesign/Navigation Icons), each trimmed
 * and centred on one square canvas at build-prep time so a single CSS box renders every icon at the same
 * visual size. They carry their own per-section colour (green Grammar, blue Vocabulary, pink Listening,
 * orange Reading …), so unlike the line icons they replace they do *not* inherit `currentColor`.
 *
 * Speaking has no supplied asset, so it keeps its original line icon, tinted to the same blue the
 * reference gives it.
 */
interface NavIconProps {
  size?: number;
  className?: string;
}

const NAV_ICON_BASE = '/assets/dashboard/redesign/nav/';

function IllustratedNavIcon({ file, size = 22, className }: NavIconProps & { file: string }) {
  return (
    <img
      src={`${NAV_ICON_BASE}${file}`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain ${className ?? ''}`}
    />
  );
}

export function DashboardNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="dashboard.webp" {...props} />;
}

export function PathNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="learning-path.webp" {...props} />;
}

export function GrammarNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="grammar.webp" {...props} />;
}

export function VocabularyNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="vocabulary.webp" {...props} />;
}

export function KanjiNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="kanji.webp" {...props} />;
}

export function ReadingNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="reading.webp" {...props} />;
}

export function ListeningNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="listening.webp" {...props} />;
}

export function MockTestNavIcon(props: NavIconProps) {
  return <IllustratedNavIcon file="mock-exam.webp" {...props} />;
}

/** No illustrated asset was supplied for Speaking — this is the app's original line icon, fixed to the
 * blue the reference uses for it so it reads as part of the same coloured set. */
export function SpeakingNavIcon({ size = 22, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 text-brand-400 ${className ?? ''}`}
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4Z"
      />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
