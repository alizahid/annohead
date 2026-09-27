'use client'

import { SteamLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { useTranslations } from 'next-intl'

import { useSteamSignIn } from '@/hooks/auth/steam'

import { Button } from '../common/button'

export function SteamSignIn() {
  const t = useTranslations('component.auth.steam')

  const { signIn, isPending, isError } = useSteamSignIn()

  return (
    <>
      <Button loading={isPending} onClick={signIn} type="button">
        <SteamLogoIcon className="size-6" weight="fill" />

        {t('action.signIn')}
      </Button>

      {isError ? <p className="text-red-11 text-sm">{t('error')}</p> : null}
    </>
  )
}
