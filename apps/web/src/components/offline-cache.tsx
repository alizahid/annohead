'use client'

import { useLocale } from 'next-intl'
import { useEffect } from 'react'

import { getPathname } from '@/intl/nav'

/** The only page saved for offline use; returning visitors who are offline see it whatever url they open. */
const offlinePage = '/calculator'

const cssUrl = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g

const whitespace = /\s+/

/** Registers public/sw.js and, on every full page load, re-saves the offline page (in this locale) with its assets. */
export function OfflineCache() {
  const locale = useLocale()

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const page = getPathname({
      href: offlinePage,
      locale,
    })

    navigator.serviceWorker
      .register(`/sw.js?page=${encodeURIComponent(page)}`)
      .then(() => save(page))
      .catch(() => {
        // offline support is best effort; a failed refresh keeps the last saved copy
      })
  }, [locale])

  return null
}

/** Downloads the page, its scripts, its stylesheets and what they load, then swaps them in for the previous copy. */
async function save(page: string) {
  const html = await download(page)
  const doc = new DOMParser().parseFromString(
    await html.clone().text(),
    'text/html',
  )
  const [scripts, styles] = await Promise.all([
    Promise.all(
      [...doc.querySelectorAll('script[src]')]
        .map((script) => sameOrigin(script.getAttribute('src')))
        .filter((url) => url !== null)
        .map(async (url) => [url.href, await download(url.href)] as const),
    ),
    Promise.all(
      [...doc.querySelectorAll('link[rel="stylesheet"]')]
        .map((link) => sameOrigin(link.getAttribute('href')))
        .filter((url) => url !== null)
        .map((url) => stylesheet(url)),
    ),
  ])

  const files = [[page, html] as const, ...scripts, ...styles.flat()]

  // ponytail: drop-and-refill is not atomic; a tab closing mid-refill loses the copy until the next online visit
  await caches.delete('offline')

  const cache = await caches.open('offline')

  await Promise.all(files.map(([url, response]) => cache.put(url, response)))

  await saveIcons(doc)
}

/**
 * Icons never change at a url, so they live in their own cache that outlasts page refreshes and only missing ones are downloaded.
 * CDN icons need the R2 CORS policy to list this origin; ones that fail are skipped.
 */
async function saveIcons(doc: Document) {
  const urls = new Set(
    [...doc.querySelectorAll('img')].flatMap((img) =>
      [
        img.getAttribute('src'),
        ...(img.getAttribute('srcset') ?? '')
          .split(',')
          .map((candidate) => candidate.trim().split(whitespace)[0]),
      ]
        .filter((src) => src)
        .map((src) => new URL(src ?? '', location.origin).href),
    ),
  )

  const cache = await caches.open('offline-icons')

  await Promise.allSettled(
    [...urls].map(async (url) => {
      if (await cache.match(url)) {
        return
      }

      // reload: the http cache holds the <img> copy, which has no cors headers
      await cache.put(
        url,
        await download(url, {
          cache: 'reload',
        }),
      )
    }),
  )
}

/** A stylesheet with the fonts and background images it loads, resolved relative to it. */
async function stylesheet(url: URL) {
  const css = await download(url.href)
  const assets = new Set(
    [...(await css.clone().text()).matchAll(cssUrl)]
      .map(([, asset]) => sameOrigin(asset, url))
      .filter((asset) => asset !== null)
      .map((asset) => asset.href),
  )

  return [
    [url.href, css] as const,
    ...(await Promise.all(
      [...assets].map(async (asset) => [asset, await download(asset)] as const),
    )),
  ]
}

function sameOrigin(href: string | null, base: string | URL = location.origin) {
  if (!href) {
    return null
  }

  const url = new URL(href, base)

  return url.origin === location.origin ? url : null
}

async function download(url: string, init?: RequestInit) {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  return response
}
