"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { addUserSport, removeUserSport, updateProfile, uploadProfileImage } from "@/server/actions/profile";
import { profileSchema, type ProfileInput, type UserSportLevel } from "@/lib/validators";

type SportOption = {
  id: string;
  name: string;
};

type UserSport = {
  id: string;
  level: UserSportLevel;
  sport: {
    id: string;
    name: string;
    icon: string | null;
  };
};

type ProfileSettingsProps = {
  user: {
    id: string;
    name: string;
    image: string | null;
    profile: {
      city: string | null;
      age: number | null;
      gender: string | null;
      bio: string | null;
      availability: string | null;
    } | null;
    sports: UserSport[];
  };
  sports: SportOption[];
};

const levelLabels: Record<UserSportLevel, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

const levelBadgeClasses: Record<UserSportLevel, string> = {
  BEGINNER: "bg-slate-100 text-slate-700 border-slate-200",
  INTERMEDIATE: "bg-blue-100 text-blue-700 border-blue-200",
  ADVANCED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXPERT: "bg-amber-100 text-amber-700 border-amber-200",
};

const genderOptions = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "OTHER", label: "Autre" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefere ne pas dire" },
];

export function ProfileSettings({ user, sports }: ProfileSettingsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [selectedSportLevel, setSelectedSportLevel] = useState<UserSportLevel>("BEGINNER");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      city: user.profile?.city ?? "",
      age: user.profile?.age ?? 18,
      gender: (user.profile?.gender as ProfileInput["gender"]) ?? "PREFER_NOT_TO_SAY",
      bio: user.profile?.bio ?? "",
      availability: user.profile?.availability ?? "",
    },
  });

  const availableSports = useMemo(
    () => sports.filter((sport) => !user.sports.some((userSport) => userSport.sport.id === sport.id)),
    [sports, user.sports],
  );

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);

    const formData = new FormData();
    formData.set("city", values.city);
    formData.set("age", String(values.age));
    formData.set("gender", values.gender);
    formData.set("bio", values.bio ?? "");
    formData.set("availability", values.availability ?? "");

    startTransition(async () => {
      const result = await updateProfile(formData);

      if (!result.success) {
        Object.entries(result.fieldErrors ?? {}).forEach(([field, errors]) => {
          const message = errors?.[0];
          if (message && field in form.getValues()) {
            form.setError(field as keyof ProfileInput, { message });
          }
        });
        return;
      }

      setMessage(result.message ?? "Profil mis a jour.");
    });
  });

  const handleAddSport = () => {
    if (!selectedSportId) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await addUserSport(selectedSportId, selectedSportLevel);
      setMessage(result.message);
      setSelectedSportId("");
      setSelectedSportLevel("BEGINNER");
    });
  };

  const handleRemoveSport = (sportId: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await removeUserSport(sportId);
      setMessage(result.message);
    });
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setMessage(null);

    startTransition(async () => {
      const result = await uploadProfileImage(file);
      setMessage(result.message);
      if (result.imageUrl) {
        setImagePreview(result.imageUrl);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>Edition des informations visibles sur ton profil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imagePreview ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                <input className="hidden" type="file" accept="image/*" onChange={handleUploadImage} />
                Changer la photo
              </label>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou WEBP. Stockage local dans `public/uploads`.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
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

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input placeholder="24" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectionner un genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Parle de ton style de jeu..." rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilite</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Soirs et week-ends" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Button disabled={isPending} type="submit">
                  Enregistrer le profil
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Mes sports</CardTitle>
            <CardDescription>Ajoute ou retire les sports que tu pratiques.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {user.sports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun sport ajoute pour le moment.</p>
              ) : (
                user.sports.map((userSport) => (
                  <div
                    key={userSport.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 p-3"
                  >
                    <div>
                      <p className="font-medium">{userSport.sport.name}</p>
                      <Badge className={levelBadgeClasses[userSport.level]} variant="outline">
                        {levelLabels[userSport.level]}
                      </Badge>
                    </div>
                    <Button
                      disabled={isPending}
                      onClick={() => handleRemoveSport(userSport.sport.id)}
                      size="sm"
                      variant="outline"
                      type="button"
                    >
                      Supprimer
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="grid gap-3">
              <Select onValueChange={setSelectedSportId} value={selectedSportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un sport" />
                </SelectTrigger>
                <SelectContent>
                  {availableSports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setSelectedSportLevel(value as UserSportLevel)} value={selectedSportLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button disabled={isPending || !selectedSportId} onClick={handleAddSport} type="button">
                Ajouter le sport
              </Button>
            </div>
          </CardContent>
        </Card>

        {message ? (
          <Card className="border-border/80 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{message}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
