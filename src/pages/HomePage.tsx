export function HomePage() {
  return (
    <main className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bubble Canvas</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
            A clean full-screen surface ready for floating bubble interactions.
          </p>
        </header>

        <div className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-inner" />
      </section>
    </main>
  )
}
