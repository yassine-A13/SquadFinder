"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DatePicker } from "@/components/ui/date-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost } from "@/server/actions/posts";
import { postSchema, type PostInput } from "@/lib/validators";

type PostFormValues = z.input<typeof postSchema>;
type PostFormOutput = z.output<typeof postSchema>;

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: PostInput;
  sports: Array<{ id: string; name: string }>;
};

const levelOptions = [
  { value: "BEGINNER", label: "Debutant" },
  { value: "INTERMEDIATE", label: "Intermediaire" },
  { value: "ADVANCED", label: "Avance" },
  { value: "EXPERT", label: "Expert" },
] as const;

const typeOptions = [
  { value: "TEAM_LOOKING_PLAYER", label: "Equipe cherche joueur" },
  { value: "PLAYER_LOOKING_TEAM", label: "Joueur cherche equipe" },
] as const;

export function PostForm({ mode, postId, initialValues, sports }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PostFormValues, unknown, PostFormOutput>({
    resolver: zodResolver(postSchema),
    defaultValues:
      initialValues ?? {
        title: "",
        description: "",
        sportId: "",
        city: "",
        matchDate: "",
        matchTime: "",
        requiredLevel: "INTERMEDIATE",
        playersNeeded: 1,
        type: "TEAM_LOOKING_PLAYER",
      },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const payload: PostInput = values;
      const result =
        mode === "create" ? await createPost(payload) : await updatePost(postId ?? "", payload);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.push("/mes-annonces");
      router.refresh();
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Creer une annonce" : "Modifier une annonce"}</CardTitle>
        <CardDescription>
          Renseignez les details du match, du besoin et du niveau recherche.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Equipe de foot a 5 cherche gardien" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Precisez le contexte, le niveau et le profil recherche."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Casablanca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du match</FormLabel>
                    <FormControl>
                      <DatePicker onChange={field.onChange} value={field.value} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matchTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="requiredLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau requis</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelOptions.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playersNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joueurs recherches</FormLabel>
                    <FormControl>
                      <Input
                        min="1"
                        onChange={(event) => field.onChange(Number(event.target.value))}
                        type="number"
                        value={field.value ?? 1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

            <div className="flex gap-3">
              <Button disabled={isPending} type="submit">
                {isPending
                  ? "Enregistrement..."
                  : mode === "create"
                    ? "Publier l'annonce"
                    : "Enregistrer les modifications"}
              </Button>
              <Button onClick={() => router.push("/mes-annonces")} type="button" variant="outline">
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
