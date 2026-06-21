import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function getCurrentUserId() {
  const currentUser = await getCurrentUser();
  return currentUser?.id ?? null;
}
