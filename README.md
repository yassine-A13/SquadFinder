# SquadFinder

Starter kit Next.js 15 avec App Router, TypeScript, Tailwind CSS, ESLint, `src/` activé et alias `@/*`.

## Stack incluse

- Next.js 15 + React 19
- Tailwind CSS v4
- Shadcn UI configuré en `default` avec base `slate`
- Prisma ORM + PostgreSQL
- Auth.js v5 beta (App Router)
- Zod
- React Hook Form + `@hookform/resolvers`
- TanStack Query

## Structure

```text
src/
  app/
    (public)/
    (dashboard)/
    (admin)/
    api/
  components/
    ui/
    shared/
  lib/
  server/
    actions/
  types/
prisma/
```

## Installation locale

1. Installer les dépendances :

```bash
npm install
```

2. Copier les variables d'environnement :

```bash
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

3. Renseigner au minimum :

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

4. Générer le client Prisma :

```bash
npm run db:generate
```

5. Créer la base via migration :

```bash
npm run db:migrate -- --name init
```

## Lancement

```bash
npm run dev
```

Application : `http://localhost:3000`

## Notes utiles

- La route Auth.js est exposée via `src/app/api/auth/[...nextauth]/route.ts`.
- Le dashboard joueur est prévu sous `/dashboard`.
- La zone admin est prévue sous `/admin`.
- Les annonces de démo utilisent TanStack Query avec `src/app/api/annonces/route.ts`.
- Les Server Actions de départ se trouvent dans `src/server/actions/`.
