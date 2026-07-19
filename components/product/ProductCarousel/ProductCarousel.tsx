import s from './ProductCarousel.module.css'
import { ProductCard } from '@components/product'
import { Product } from '@lib/types/types'

interface ProductCarouselProps {
  products: Product[]
}

const ProductCarousel = ({ products }: ProductCarouselProps) => {
  return (
    <section className={s.root}>
      <div className={s.header}>
        <h2 className={s.title}>New in</h2>
        <p className={s.subtitle}>Everything that&apos;s hot right now</p>
      </div>

      <div className={s.carouselContainer}>
        <div className={s.carousel}>
          {products.map((product) => (
            <div key={product.id} className={s.item}>
              <ProductCard
                product={product}
                variant="slim"
                imgProps={{
                  alt: product.name,
                  width: 320,
                  height: 480,
                  className: 'object-cover',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductCarousel
