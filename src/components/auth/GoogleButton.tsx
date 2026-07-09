/**
 * Google sign-in slot — genuinely disabled, not a dead button pretending to work. Enable once Google OAuth
 * is configured on the Supabase project (Auth > Providers > Google), per the confirmed shape brief.
 */
export function GoogleButton() {
  return (
    <button
      type="button"
      disabled
      title="Google sign-in is coming soon"
      className="w-full flex items-center justify-center gap-2.5 h-11 rounded-md border border-white/12 text-sm font-semibold text-white/35 cursor-not-allowed"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="opacity-50">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.8 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.5 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.8 3 24 3c-7.5 0-14 4.3-17.7 10.7z" />
        <path fill="#4CAF50" d="M24 45c5.7 0 10.7-1.9 14.6-5.2l-6.7-5.6c-2.1 1.4-4.8 2.3-7.9 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 40.5 16.4 45 24 45z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.7 5.6C41.6 36.3 45 30.9 45 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
      Continue with Google
      <span className="text-[10px] font-semibold uppercase tracking-wide">Soon</span>
    </button>
  );
}
