type SiteShellProps = { children: React.ReactNode; title: string; description: string };

export async function SiteShell({ children, title, description }: SiteShellProps) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="animate-sport-in space-y-3 border-l-4 border-primary pl-5">
          <p className="sport-label">TeamMatch</p>
          <h1 className="page-title">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
