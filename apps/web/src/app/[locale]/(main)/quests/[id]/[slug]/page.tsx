import { anno } from '@anno/db/client'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { QuestPage } from '@/components/quests/page'
import { getId, parseQuestPicks, validateLocale } from '@/lib/validators'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/quests/[id]/[slug]'>): Promise<Metadata> {
  const { locale, id } = await params

  const quest = await anno.quests.get({
    id: getId(id),
    lang: validateLocale(locale),
  })

  if (!quest) {
    notFound()
  }

  const t = await getTranslations('page.quest')

  return {
    title: t('title', {
      name: quest.name ?? t('fallback'),
    }),
  }
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/[locale]/quests/[id]/[slug]'>) {
  const { locale, id } = await params

  const lang = validateLocale(locale)

  const quest = await anno.quests.get({
    id: getId(id),
    lang,
  })

  if (!quest) {
    notFound()
  }

  // the picks made in earlier quests of the series come along in the URL
  const { picks } = await parseQuestPicks(searchParams)

  const { carry, played } = await anno.quests.carry(quest, picks, lang)

  return <QuestPage carry={carry} played={played} quest={quest} />
}
