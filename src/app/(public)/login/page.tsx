import { AuthForm } from "@/components/shared/auth-form";
import { isGoogleAuthEnabled } from "@/lib/auth-env";

export default function LoginPage() {
  return <AuthForm mode="login" showGoogleSignIn={isGoogleAuthEnabled} />;
}
