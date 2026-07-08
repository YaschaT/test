export interface DisplayPrefs {
  furigana: boolean;
  romaji: boolean;
}

interface DisplayTogglesProps {
  prefs: DisplayPrefs;
  onChange: (prefs: DisplayPrefs) => void;
}

export function DisplayToggles({ prefs, onChange }: DisplayTogglesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleChip
        label="Furigana"
        active={prefs.furigana}
        onClick={() => onChange({ ...prefs, furigana: !prefs.furigana })}
      />
      <ToggleChip
        label="Romaji"
        active={prefs.romaji}
        onClick={() => onChange({ ...prefs, romaji: !prefs.romaji })}
      />
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
        active
          ? 'bg-brand-600 border-brand-600 text-white'
          : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
      }`}
    >
      {label}
    </button>
  );
}
