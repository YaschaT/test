import { AuthShell } from '../../components/auth/AuthShell';
import { RegisterForm } from '../../components/auth/RegisterForm';

export function Register() {
  return (
    <AuthShell mode="register" tagline="Create an account to keep your progress safe everywhere">
      <RegisterForm />
    </AuthShell>
  );
}
