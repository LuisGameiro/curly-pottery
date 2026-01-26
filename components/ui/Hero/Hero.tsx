import { Text } from '@components/ui'
import s from './Hero.module.css'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  className?: string
  headline: string
  description: string
}

const Hero = ({ headline, description }: HeroProps) => {
  return (
    <section>
      <div className={s.root}>
        <Text className={s.title} variant="heading">
          {headline}
        </Text>
        <div className={s.description}>
          <Text variant="body">{description}</Text>
          <Link href="/about" className={s.link}>
            Read it here
            <ArrowRight slope="18" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
