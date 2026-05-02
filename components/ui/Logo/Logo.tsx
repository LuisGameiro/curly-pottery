import Image from 'next/image'

const Logo = ({ className = '', ...props }) => (
  <Image
    src="/Curly Logo Final 1.png"
    alt="Logo"
    width={64}
    height={64}
    quality={100}
    loading="eager"
    className={className}
    {...props}
  />
)

export default Logo
