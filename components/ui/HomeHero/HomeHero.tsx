import s from './HomeHero.module.css'
import Image from 'next/image'
import Link from 'next/link'
import potteryHandsImage from '@public/Homepage 2.jpg'
import artistImage from '@public/Homepage 1.jpg'

const HomeHero = () => {
  return (
    <section className={s.root}>
      {/* Left Text Block */}
      <div className={s.textBlock}>
        <h1 className={s.everyday}>Everyday rituals</h1>
        <h2 className={s.studio}>Curly Studio</h2>
        <Link href="/shop" className={s.viewShop}>
          View shop
        </Link>
      </div>

      {/* Center Image (Pottery Hands) */}
      <Link href="/about" className={s.centerImage}>
        <div className={s.imageWrapper}>
          <Image
            src={potteryHandsImage}
            alt="Hands making pottery"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
            priority
            placeholder="blur"
          />
        </div>
      </Link>

      {/* Right Image (Artist) */}
      <Link href="/about" className={s.rightImage}>
        <div className={s.imageWrapper}>
          <Image
            src={artistImage}
            alt="Curly Pottery Artist"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
            priority
            placeholder="blur"
          />
        </div>
      </Link>
    </section>
  )
}

export default HomeHero
