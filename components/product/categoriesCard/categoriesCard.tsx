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
      className="relative h-full flex"
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
            paddingRight: '16px',
          }}
          {...imgProps}
          placeholder="blur"
          blurDataURL={shimmerDataUrl(250, 250)}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20  ">
        <p className="bg-background/40 text backdrop-blur-sm px-4 capitalize">
          {cat.name}
        </p>
      </div>
    </Link>
  )
}

export default CategoriesCard
