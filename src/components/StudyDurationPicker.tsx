import {
  formatDuration,
  MAX_STUDY_MINUTES,
  MIN_STUDY_MINUTES,
  STUDY_DURATION_PRESETS,
  STUDY_MINUTES_STEP,
} from '../lib/studyPlanCalculator';

interface StudyDurationPickerProps {
  minutes: number;
  onChange: (minutes: number) => void;
}

export function StudyDurationPicker({ minutes, onChange }: StudyDurationPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="study-duration-slider" className="text-sm text-slate-500 dark:text-slate-400">
          How much time do you have today?
        </label>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 leading-none">
          {formatDuration(minutes)}
        </p>
      </div>

      <input
        id="study-duration-slider"
        type="range"
        min={MIN_STUDY_MINUTES}
        max={MAX_STUDY_MINUTES}
        step={STUDY_MINUTES_STEP}
        value={minutes}
        onChange={(e) => onChange(Number(e.target.value))}
        className="plan-slider w-full accent-brand-600"
        aria-valuetext={formatDuration(minutes)}
      />

      <div className="flex flex-wrap gap-2">
        {STUDY_DURATION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={minutes === preset}
            onClick={() => onChange(preset)}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition-all active:scale-95 ${
              minutes === preset
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {formatDuration(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
