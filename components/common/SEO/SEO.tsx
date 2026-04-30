import { Metadata } from 'next'
import config from '../config/seo_meta.json'
import { getAppUrl, resolveSiteUrl } from '@lib/site-url'

type OGImage = {
  url: string | URL
  width?: number | string
  height?: number | string
  alt?: string
}

type MetadataImage = string | URL | OGImage

const metadataBase = new URL(getAppUrl())

const normalizeImageDimension = (value?: number | string) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const parsedValue = Number.parseInt(value, 10)

  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

const normalizeImage = (image: MetadataImage) => {
  if (typeof image === 'string' || image instanceof URL) {
    return { url: resolveSiteUrl(image) }
  }

  return {
    url: resolveSiteUrl(image.url),
    width: normalizeImageDimension(image.width),
    height: normalizeImageDimension(image.height),
    alt: image.alt,
  }
}

const resolveMetadataUrl = (value?: string | URL | null) => {
  if (!value) {
    return undefined
  }

  return resolveSiteUrl(value)
}

export default function constructMetadata({
  title,
  description,
  openGraph,
  robots,
  canonical,
}: {
  title?: string
  description?: string
  robots?: Metadata['robots']
  canonical?: string | URL
  openGraph?: Metadata['openGraph']
} = {}): Metadata {
  const seoTitle = title
    ? config.titleTemplate.replaceAll('%s', title)
    : config.title

  const seoDescription = description || config.description
  const canonicalUrl = resolveMetadataUrl(canonical)
  const openGraphUrl = resolveMetadataUrl(
    openGraph?.url?.toString() || canonicalUrl || getAppUrl(),
  )
  const openGraphType =
    openGraph && 'type' in openGraph ? openGraph.type : undefined

  const images = (openGraph?.images || config.openGraph.images) as
    | MetadataImage
    | MetadataImage[]
  const ogImages = Array.isArray(images)
    ? images.map((img) => normalizeImage(img))
    : [normalizeImage(images)]

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    metadataBase,
    openGraph: {
      title: openGraph?.title || seoTitle,
      description: openGraph?.description || seoDescription,
      url: openGraphUrl,
      siteName: openGraph?.siteName || config.openGraph.site_name,
      locale: openGraph?.locale || 'en_GB',
      type: openGraphType || config.openGraph.type,
      images: ogImages,
    } as Metadata['openGraph'],
    twitter: {
      card: config.twitter.cardType as 'summary_large_image',
      title: openGraph?.title || seoTitle,
      images: ogImages,
      description: openGraph?.description || seoDescription,
      site: config.twitter.site,
      creator: config.twitter.handle,
    } as Metadata['twitter'],
    robots: robots ?? {
      index: true,
      follow: true,
    },
  }
}
