import cn from 'clsx'
import Image from 'next/image'
import s from './ProductView.module.css'
import { FC, useEffect,useState } from 'react'

import { ProductSlider, ProductCard } from '@components/product'
import { Container, Text } from '@components/ui'
import { SEO } from '@components/common'
import ProductSidebar from '../ProductSidebar'
import { Product } from '@lib/types/product'
import { getRelatedProducts } from 'actions/product.actions'
import { ProductVariant } from 'prisma/generated/prisma/client'

interface ProductViewProps {
  product: Product
}

const ProductView: FC<ProductViewProps> = ({ product }) => {

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [variant , setVariant] = useState<ProductVariant>(product.variants[0]);


  console.log('Product in ProductView:', product);
  // useEffect(() => {
  //   const fetchRelated = async () => {
  //     try {
  //       const res = await getRelatedProducts(product.categories, product.id, 3)
  //       setRelatedProducts(res)
  //     } catch (err) {
  //       console.error('Failed to fetch related products', err)
  //     }
  //   }

  //   fetchRelated()
  // }, [product])
  
  return (
    <>
      <Container className="max-w-none w-full" clean>
        <div className={cn(s.root, 'fit')}>
          <div className={cn(s.main, 'fit')}>
            <div className={s.sliderContainer}>
              <ProductSlider key={product.id}>
                {variant.images.map((image, i) => (
                  <div key={image} className={s.imageContainer}>
                    <Image
                      className={s.img}
                      src={image}
                      alt={`${product.name} Image ${i}`}
                      width={600}
                      height={600}
                      priority={i === 0}
                      quality="100"
                    />
                  </div>
                ))}
              </ProductSlider>
            </div>
          </div>

          <ProductSidebar
            key={product.id}
            product={product}
            variant={variant}
            setVariant={setVariant}
            className={s.sidebar}
          />
        </div>
        <hr className="mt-7 border-accent-2" />
        {relatedProducts.length > 0 && (
        <section className="py-12 px-6 mb-10 text-primary">
          <Text variant="sectionHeading" className='text-accent-4'>Related Products</Text>
          <div className={s.relatedProductsGrid}>
            { relatedProducts.map((p) => (
              <div key={p.slug} className="bg-accent-0 border border-accent-2">
                <ProductCard
                  noNameTag 
                  product={p}
                  key={p.slug}
                  variant="default"
                  
                  className="animated fadeIn"
                  imgProps={{
                    alt: p.name,
                    className: 'w-full h-full object-cover',
                  }}
                />
              </div>
            ))}
          </div>
        </section>  )}
      </Container>
      <SEO
        title={product.name}
        description={product.description}
        openGraph={{
          type: 'website',
          title: product.name,
          description: product.description,
          images: [
            {
              url: product.images[0],
              width: '800',
              height: '600',
              alt: product.name,
            },
          ],
        }}
      />
    </>
  )
}

export default ProductView
