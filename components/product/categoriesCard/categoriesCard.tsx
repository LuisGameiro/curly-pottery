import Link from 'next/link'
import Image, { ImageProps } from 'next/image'
import { Category } from '@lib/types/types'
import { shimmerDataUrl } from '@lib/shimmer'

interface Props {
  className?: string
  cat: Category
  noNameTag?: boolean
  imgProps?: Omit<ImageProps, 'src' | 'layout' | 'placeholder' | 'blurDataURL'>
}

const placeholderImg = '/product-img-placeholder.svg'

const CategoriesCard = ({ cat, imgProps }: Props) => {
  if (!cat) return null

  return (
    <Link
      href={`/shop?category=${cat?.slug}`}
      aria-label={cat?.name}
      className="relative w-full h-full p-2 gap-2"
    >
      {cat.image && (
        <Image
          src={cat.image || placeholderImg}
          alt={cat.name || 'Product Image'}
          height={250}
          width={250}
          quality={85}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            aspectRatio: '1/1',
            objectFit: 'cover',
            padding: '8px',
          }}
          {...imgProps}
          placeholder="blur"
          blurDataURL={shimmerDataUrl(250, 250)}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 ">
        <p className="bg-background/40 text-2xl px-5 py-1 text-center text backdrop-blur-sm">
          {cat.name}
        </p>
      </div>
    </Link>
  )
}

export default CategoriesCard
