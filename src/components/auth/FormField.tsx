import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  id: string;
  label: string;
  error?: string;
  onChange: (value: string) => void;
}

/**
 * Labeled input for the redesigned auth scene — always dark (this page doesn't follow the app's light/dark
 * toggle, same convention as the hero panels elsewhere), with sharper, more editorial corners and a
 * vermillion focus ring instead of the app's usual candy-rounded/indigo-focus inputs, to carry the new
 * typographic voice through every control on the page. Validated on blur by the caller, not on every
 * keystroke, per interaction-design.md; error wired via aria-describedby.
 */
export function FormField({ id, label, error, onChange, className = '', ...props }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-white/50">
        {label}
      </label>
      <input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full h-11 px-3.5 rounded-md bg-white/[0.04] border text-[15px] text-white placeholder:text-white/30 outline-none transition-colors ${
          error
            ? 'border-red-400/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/30'
            : 'border-white/15 focus:border-[#e34a33] focus:ring-2 focus:ring-[#e34a33]/30'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-400 animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
