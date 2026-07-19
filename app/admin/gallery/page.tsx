import { noIndexMetadata } from '@lib/constants/metadata'
import GalleryClient from '@components/admin/GalleryClient'

export const metadata = noIndexMetadata

export default function AdminGalleryPage() {
  return <GalleryClient />
}
