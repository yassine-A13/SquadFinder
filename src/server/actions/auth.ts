"use server";

import { hash } from "bcrypt";

import { prisma } from "@/lib/prisma";
import { registerUserSchema } from "@/lib/validators";

type RegisterUserResult = {
  success: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string[]>>;
};

export async function registerUser(formData: FormData): Promise<RegisterUserResult> {
  const parsed = registerUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      fieldErrors: {
        email: ["Un compte existe deja avec cette adresse e-mail."],
      },
    };
  }

  const passwordHash = await hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      profile: {
        create: {
          city: null,
          age: null,
          gender: null,
          bio: null,
          availability: null,
        },
      },
    },
  });

  return {
    success: true,
    message: "Compte cree avec succes.",
  };
}
