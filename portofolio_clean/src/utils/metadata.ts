import { useEffect } from 'react'

type MetadataConfig = {
  title: string
  description: string
  path: string
  robots?: string
}

const SITE_URL = 'https://faturachman.my.id'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

const upsertMeta = (selector: string, attributes: Record<string, string>, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

const upsertLink = (selector: string, rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export const useDocumentMetadata = ({ title, description, path, robots }: MetadataConfig) => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    const robotsValue = robots || 'index, follow'

    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description' }, description)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url)
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, DEFAULT_IMAGE)
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, DEFAULT_IMAGE)

    upsertMeta('meta[name="robots"]', { name: 'robots' }, robotsValue)

    upsertLink('link[rel="canonical"]', 'canonical', url)
  }, [description, path, robots, title])
}
