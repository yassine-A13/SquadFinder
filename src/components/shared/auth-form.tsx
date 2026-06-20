"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/server/actions/auth";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validators";

type AuthFormProps =
  | {
      mode: "login";
      showGoogleSignIn: boolean;
    }
  | {
      mode: "register";
      showGoogleSignIn: boolean;
    };

export function AuthForm({ mode, showGoogleSignIn }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const schema = mode === "login" ? loginSchema : registerSchema;

  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      try {
        if (mode === "login") {
          const result = await signIn("credentials", {
            ...values,
            redirect: false,
            redirectTo: callbackUrl,
          });

          if (result?.error) {
            setFormError("E-mail ou mot de passe incorrect.");
            return;
          }

          router.push(result?.url ?? callbackUrl);
          router.refresh();
          return;
        }

        const formData = new FormData();
        formData.set("name", (values as RegisterInput).name);
        formData.set("email", values.email);
        formData.set("password", values.password);

        const result = await registerUser(formData);

        if (!result.success) {
          if (result.fieldErrors?.name?.[0]) {
            form.setError("name", { message: result.fieldErrors.name[0] });
          }

          if (result.fieldErrors?.email?.[0]) {
            form.setError("email", { message: result.fieldErrors.email[0] });
          }

          if (result.fieldErrors?.password?.[0]) {
            form.setError("password", { message: result.fieldErrors.password[0] });
          }

          if (!result.fieldErrors) {
            setFormError(result.message ?? "Impossible de creer le compte.");
          }

          return;
        }

        const signInResult = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          redirectTo: callbackUrl,
        });

        if (signInResult?.error) {
          router.push("/login");
          router.refresh();
          return;
        }

        router.push(signInResult?.url ?? callbackUrl);
        router.refresh();
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }

        setFormError("Une erreur est survenue. Reessayez.");
      }
    });
  });

  const handleGoogleSignIn = () => {
    setFormError(null);

    startTransition(async () => {
      await signIn("google", {
        redirectTo: callbackUrl,
      });
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Connexion" : "Creer un compte"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Connectez-vous avec votre e-mail ou Google."
            : "Inscrivez-vous avec un compte TeamMatch ou Google."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "register" ? (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Nom</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Yassine Cheraa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">E-mail</FormLabel>
                  <FormControl>
                    <Input id="email" placeholder="vous@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Mot de passe</FormLabel>
                  <FormControl>
                    <Input id="password" placeholder="********" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <Button className="w-full" disabled={isPending} type="submit">
              {mode === "login" ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
        </Form>

        {showGoogleSignIn ? (
          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
          >
            Continuer avec Google
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
