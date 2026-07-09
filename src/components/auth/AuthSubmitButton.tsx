import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * The redesign's primary action — deliberately its own component rather than reusing the app-wide
 * `PrimaryButton` (candy-rounded indigo pill used everywhere else). This page's whole point is a different
 * typographic/visual voice, so its one CTA gets sharper corners and the torii vermillion signature color
 * instead of the app's usual indigo, without touching `PrimaryButton` and rippling that change everywhere.
 */
export function AuthSubmitButton({ children, className = '', type = 'button', ...props }: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`w-full h-11 rounded-md font-semibold text-white bg-[#e34a33] hover:bg-[#ee5a41] active:bg-[#c73f2b] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}
