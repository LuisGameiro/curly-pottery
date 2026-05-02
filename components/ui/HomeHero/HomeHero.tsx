import s from './HomeHero.module.css'
import Image from 'next/image'
import Link from 'next/link'

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
      <div className={s.centerImage}>
        <div className={s.imageWrapper}>
          <Image
            src="/Homepage 2.jpg"
            alt="Hands making pottery"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Image (Artist) */}
      <div className={s.rightImage}>
        <div className={s.imageWrapper}>
          <Image
            src="/Homepage 1.jpg"
            alt="Curly Pottery Artist"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}

export default HomeHero
