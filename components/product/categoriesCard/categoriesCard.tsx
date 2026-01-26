import Link from 'next/link'
import Image, { ImageProps } from 'next/image'
import { Category } from '@lib/types/types'

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
      className="relative block h-full w-full overflow-hidden"
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
          }}
          {...imgProps}
        />
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <h1 className=" bg-accent-3/60 text-2xl px-5 py-1 text-center text-on-primary">
          {cat.name}
        </h1>
      </div>
    </Link>
  )
}

export default CategoriesCard
