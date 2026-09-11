import { anno } from '@anno/db/client'

function Json({ title, data }: { title: string; data: unknown }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold text-lg">{title}</h2>
      <pre className="overflow-x-auto rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  )
}

export default async function Home() {
  const [specialists, buildings] = await Promise.all([
    anno.specialists.list({
      lang: 'en',
      perPage: 3,
      rarity: ['Legendary'],
    }),
    anno.buildings.list({ kind: ['Production'], lang: 'en', perPage: 3 }),
  ])
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <h1 className="font-bold text-2xl">Anno 117 data</h1>
      <Json data={specialists} title="Legendary specialists" />
      <Json data={buildings} title="Production buildings" />
    </main>
  )
}
