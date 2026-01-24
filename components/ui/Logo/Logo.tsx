import Image from 'next/image'

const Logo = ({ className = '', ...props }) => (
  <Image
    src="/Logo.png"
    alt="Logo"
    width={64}
    height={64}
    loading="eager"
    className={className}
    {...props}
  />
)

export default Logo
