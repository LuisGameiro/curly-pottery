// utils/seo.ts
import { Metadata } from "next";
import config from "../config/seo_meta.json";

const storeUrl = process.env.NEXT_PUBLIC_APP_URL;
const storeBaseUrl = storeUrl ? `https://${storeUrl}` : "";

export default function constructMetadata({
  title,
  description,
  openGraph,
  robots,
  canonical,
}: {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  openGraph?: any; // You can type this strictly using Metadata['openGraph']
} = {}): Metadata {
  const seoTitle = title
    ? config.titleTemplate.replace(/%s/g, title)
    : config.title;

  const seoDescription = description || config.description;

  const images = openGraph?.images || config.openGraph.images;
  const ogImages = images.map((img: any) => ({
    url: img.url.startsWith("http") ? img.url : `${storeBaseUrl}${img.url}`,
    width: img.width,
    height: img.height,
    alt: img.alt,
  }));

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonical || storeBaseUrl,
    },
    metadataBase: new URL(storeBaseUrl),
    openGraph: {
      title: openGraph?.title || seoTitle,
      description: openGraph?.description || seoDescription,
      url: openGraph?.url || storeBaseUrl,
      siteName: openGraph?.site_name || config.openGraph.site_name,
      locale: openGraph?.locale || "en_US",
      type: (openGraph?.type || config.openGraph.type) as any,
      images: ogImages,
    },
    twitter: {
      card: config.twitter.cardType as any,
      title: openGraph?.title || seoTitle,
      images: ogImages,
      description: openGraph?.description || seoDescription,
      site: config.twitter.site,
      creator: config.twitter.handle,
    },
    robots: robots ?? "index, follow",
  };
}
