/**
 * The sidebar's navigation icons.
 *
 * Eight of them are the supplied illustrated assets (Dashboard-redesign/Navigation Icons), each trimmed
 * and centred on one square canvas at build-prep time so a single CSS box renders every icon at the same
 * visual size.
 *
 * Their colour is baked into the pixels — these do *not* inherit `currentColor` — so the six skill icons
 * were re-hued in place to `SKILL_THEME[skill].from`, the exact value each section's banner uses for its
 * border, ring and watermark. Only the hue was replaced; the artwork's own saturation and value are
 * untouched, so every highlight and shadow in the illustration survives. A skill's colour is now one
 * value shared by its sidebar icon, its banner and its category badge — change `SKILL_THEME` and re-run
 * the re-hue to move all three together.
 *
 * Dashboard, Learning Path and Mock Exam stay neutral: they aren't skills, and their greyscale is what
 * separates the two top-level destinations and the assessment from the six coloured LEARN entries.
 */
import { SKILL_THEME } from '../../lib/skillTheme';

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

/** No illustrated asset was supplied for Speaking — this is the app's original line icon. Being real SVG
 * it can just take the colour rather than being re-hued like the others, so it reads it straight off
 * SKILL_THEME: the same value its banner border, ring and watermark use. */
export function SpeakingNavIcon({ size = 22, className }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className ?? ''}`}
      style={{ color: SKILL_THEME.speaking.from }}
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
