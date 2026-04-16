const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const getConfiguredAppUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured.')
  }

  return rawUrl
}

export const getAppUrl = () => {
  const rawUrl = getConfiguredAppUrl()

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return stripTrailingSlash(rawUrl)
  }

  return `https://${stripTrailingSlash(rawUrl)}`
}

export const resolveSiteUrl = (urlOrPath: string | URL) =>
  new URL(urlOrPath.toString(), getAppUrl()).toString()
