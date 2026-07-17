import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  id: string;
  label: string;
  /** Always-visible helper line between label and input (e.g. password requirements). */
  hint?: string;
  error?: string;
  /** Password fields: renders the show/hide control and manages the text/password toggle. */
  revealable?: boolean;
  onChange: (value: string) => void;
}

/**
 * Labeled input for the Living Ink auth surface (auth.css) — visible uppercase label, hairline
 * border, vermilion focus, error wired via aria-describedby. Validated on blur by the caller,
 * not on every keystroke, per interaction-design.md.
 */
export function FormField({ id, label, hint, error, revealable, type, onChange, className = '', ...props }: FormFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const inputType = revealable ? (revealed ? 'text' : 'password') : type;

  return (
    <div className="au-field">
      <label htmlFor={id} className="au-label">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="au-hint">
          {hint}
        </p>
      )}
      <div className="au-input-wrap">
        <input
          id={id}
          type={inputType}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`au-input${error ? ' has-error' : ''}${revealable ? ' has-reveal' : ''} ${className}`}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            className="au-reveal"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="au-field-error animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
