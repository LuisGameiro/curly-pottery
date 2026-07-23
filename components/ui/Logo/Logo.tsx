import Image from 'next/image'
import logoImage from '@public/Curly Logo Final 1.png'

const Logo = ({ className = '', ...props }) => (
  <Image
    src={logoImage}
    alt="Logo"
    quality={85}
    loading="eager"
    className={className}
    placeholder="blur"
    {...props}
  />
)

export default Logo
