import type { InputHTMLAttributes } from 'react';
import { Input } from '../ui/input';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> {
  id: string;
  label: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Labeled input with a below-field error message wired via aria-describedby — validated on blur by the caller, not on every keystroke, per interaction-design.md. */
export function FormField({ id, label, error, onChange, className = '', ...props }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 px-3.5 text-base ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400 animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
