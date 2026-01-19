import NextLink, { LinkProps as NextLinkProps } from "next/link";

const Link = (
  {
    href,
    children,
    ...props
  }: NextLinkProps & {
    children?: React.ReactNode;
  }
) => {
  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
};

export default Link;
