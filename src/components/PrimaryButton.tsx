import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { PRIMARY_BUTTON_CLASSES } from '../lib/buttonStyles';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Tactile "press-depth" button: rests with a solid bottom ledge, lifts slightly on hover, and flattens
 * down on press — a game-like satisfying click without copying any specific product's exact style.
 * Used for the one primary action per screen; secondary actions stay as plain text/outline buttons.
 */
export function PrimaryButton({ children, className = '', type = 'button', ...props }: PrimaryButtonProps) {
  return (
    <button type={type} {...props} className={`${PRIMARY_BUTTON_CLASSES} ${className}`}>
      {children}
    </button>
  );
}
