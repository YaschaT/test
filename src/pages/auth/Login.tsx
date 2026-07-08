import { AuthShell } from '../../components/auth/AuthShell';
import { LoginForm } from '../../components/auth/LoginForm';

export function Login() {
  return (
    <AuthShell mode="login" tagline="Sign in to sync your progress across devices">
      <LoginForm />
    </AuthShell>
  );
}
