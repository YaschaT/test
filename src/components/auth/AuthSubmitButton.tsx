import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * The auth surface's primary action — the homepage's button language (ink block, 2px radius,
 * vermilion on hover; see .hp-btn--primary in home.css), not the app's candy-rounded indigo
 * `PrimaryButton`. Styles live in auth.css (.au-btn).
 */
export function AuthSubmitButton({ children, className = '', type = 'button', ...props }: AuthSubmitButtonProps) {
  return (
    <button type={type} {...props} className={`au-btn au-btn--primary ${className}`}>
      {children}
    </button>
  );
}
