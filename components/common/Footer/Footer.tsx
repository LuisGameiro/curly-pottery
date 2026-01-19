import { FC, ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@components/ui";
import { I18nWidget } from "@components/common";
import ThemeSwitcher from "@components/ui/ThemeSwitcher";
import s from "./Footer.module.css";

type Page = {
  name: string;
  url: string;
};

interface Props {
  className?: string;
  children?: ReactNode;
  pages?: Page[];
}

const links = [
  {
    name: "FAQ",
    url: "/faq",
  },
  {
    name: "Contacts",
    url: "/contacts",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Terms of Service",
    url: "/terms",
  },
  {
    name: "Privacy Policy",
    url: "/privacy",
  }

];

const Footer: FC<Props> = () => {
  return (
    <footer className={s.root}>
      <div className={s.menuContainer}>
        <Link href="/" className={s.logoContainer}>
          <Logo className={s.logo} />
          <span>Curly Pottery</span>
        </Link>

        <div className={s.menu}>
          <nav className={s.navlist}>
            {links.map((item) => (
              <Link key={item.name} href={item.url}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={s.widgetContainer}>
            <ThemeSwitcher />
            <I18nWidget />
          </div>
        </div>
      </div>

      <div className={s.signature}>
        <span>&copy; 2025 Curly Pottery, Inc. All rights reserved.</span>
        <span>Created by Luis Gameiro</span>
      </div>
    </footer>
  );
};

export default Footer;
