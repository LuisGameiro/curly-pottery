import Link from "next/link";
import s from "./Navbar.module.css";
import NavbarRoot from "./NavbarRoot";
import { Logo, Container } from "@components/ui";
import { UserNav } from "@components/common";

interface Link {
  href: string;
  label: string;
}

interface NavbarProps {
  links?: Link[];
}

const Navbar = (
  {
    links
  }: NavbarProps
) => (<NavbarRoot>
  <Container clean className="max-w-10/12 mx-auto">
    <div className={s.nav}>
      <div className="flex items-center">
        <Link href="/" className={s.logo} aria-label="Logo">
          <div className="flex items-center flex-row">
            <Logo />
            <h1 className="ml-4 mr-8 text-on-primary hidden lg:block">
              Curly Pottery
            </h1>
          </div>
        </Link>

        {links && (
          <nav className={s.navMenu}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={s.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center justify-end flex-1 space-x-8">
        <UserNav />
      </div>
    </div>
  </Container>
</NavbarRoot>);

export default Navbar;
