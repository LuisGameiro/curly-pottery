import { Metadata } from "next";
import config from "../config/seo_meta.json";

type OGImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

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
  openGraph?: Metadata["openGraph"];
} = {}): Metadata {
  const seoTitle = title
    ? config.titleTemplate.replace(/%s/g, title)
    : config.title;

  const seoDescription = description || config.description;

  const images = (openGraph?.images || config.openGraph.images) as
    | OGImage
    | OGImage[];
  const ogImages = Array.isArray(images)
    ? images.map((img: OGImage) => ({
        url: img.url.startsWith("http") ? img.url : `${storeBaseUrl}${img.url}`,
        width: img.width,
        height: img.height,
        alt: img.alt,
      }))
    : [images];

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
      siteName: openGraph?.siteName || config.openGraph.site_name,
      locale: openGraph?.locale || "en_US",
      type: config.openGraph.type,
      images: ogImages,
    } as Metadata["openGraph"],
    twitter: {
      card: config.twitter.cardType as "summary_large_image",
      title: openGraph?.title || seoTitle,
      images: ogImages,
      description: openGraph?.description || seoDescription,
      site: config.twitter.site,
      creator: config.twitter.handle,
    } as Metadata["twitter"],
    robots: robots ?? "index, follow",
  };
}
