import Image from "next/image";

const Logo = (props: React.ComponentPropsWithoutRef<typeof Image>) => (
  <Image
    width={64}
    height={64}
    {...props}
    src='/Logo.png'
    alt="Curly Logo"
  />
);

export default Logo;
