import { AuthForm } from "@/components/shared/auth-form";
import { isGoogleAuthEnabled } from "@/lib/auth-env";

export default function RegisterPage() {
  return <AuthForm mode="register" showGoogleSignIn={isGoogleAuthEnabled} />;
}
