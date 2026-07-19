import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { syncProgressAfterSignIn } from '../../lib/progressSync';
import '../../components/auth/auth.css';

/**
 * Landing spot for the Google OAuth redirect. The Supabase client parses the tokens out of the
 * URL on its own (detectSessionInUrl); this page just waits for that session to materialize,
 * runs the same post-sign-in progress sync the email forms do, and moves on to the dashboard.
 * If no session shows up (visitor cancelled at Google, stale link), it falls back to /login.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      navigate('/login', { replace: true });
      return;
    }

    let finished = false;
    async function finish(userId: string) {
      if (finished) return;
      finished = true;
      await syncProgressAfterSignIn(userId);
      navigate('/dashboard', { replace: true });
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) finish(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) finish(session.user.id);
    });
    const timeout = setTimeout(() => {
      if (!finished) navigate('/login', { replace: true });
    }, 8000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="au-surface" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Signing you in…
      </p>
    </div>
  );
}
