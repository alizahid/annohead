'use client'

import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { useSignUp } from '@/hooks/auth/sign-up'
import { Link } from '@/intl/nav'

import { Button } from '../common/button'
import { Field } from '../common/field'
import { TextBox } from '../common/text-box'

export function SignUp() {
  const t = useTranslations('component.auth.signUp')

  const { form, isPending, onSubmit } = useSignUp()

  return (
    <form
      className="flex flex-1 flex-col items-center justify-center"
      onSubmit={onSubmit}
    >
      <div className="flex w-sm flex-col items-stretch gap-4">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <Field
              error={fieldState.error?.message}
              label={t('field.username.label')}
            >
              <TextBox
                {...field}
                placeholder={t('field.username.placeholder')}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field
              error={fieldState.error?.message}
              label={t('field.password.label')}
            >
              <TextBox
                {...field}
                placeholder={t('field.password.placeholder')}
                type="password"
              />
            </Field>
          )}
        />

        <Button loading={isPending} type="submit">
          {t('action.submit')}
        </Button>

        <Link
          className="text-gray-11 text-sm leading-tight"
          href="/auth/sign-in"
        >
          {t('action.signIn')}
        </Link>
      </div>
    </form>
  )
}
