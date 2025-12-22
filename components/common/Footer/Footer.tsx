import { FC } from "react";
import Link from "next/link";
import type { Page } from "@lib/types/inspiration/page";
import { Logo, Container } from "@components/ui";
import { I18nWidget } from "@components/common";
import ThemeSwitcher from "@components/ui/ThemeSwitcher";
import s from "./Footer.module.css";
import { cn } from "@lib/utils";

interface Props {
  className?: string;
  children?: any;
  pages?: Page[];
}

const links = [
  {
    name: "Home",
    url: "/",
  },
];

const Footer: FC<Props> = ({ className, pages }) => {
  const rootClassName = cn(s.root, className);

  return (
    <footer className={rootClassName}>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start py-12 border-b border-accent-2 gap-10">
          <div className="shrink-0">
            <Link href="/" className="flex items-center font-bold">
              <span className="rounded-full border-2 border-accent-6 mr-2 p-1">
                <Logo />
              </span>
              <span className="text-2xl text-accent-0">Curly Pottery</span>
            </Link>
          </div>

          <nav className="flex flex-col space-y-3">
            {["FAQ", "Contacts", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-accent-9 hover:text-accent-6 transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="items-center space-y-4">
            <ThemeSwitcher />
            <I18nWidget />
          </div>
        </div>

        <div className="py-6 flex flex-col md:row justify-between items-center text-accent-6 text-sm gap-2">
          <span>&copy; 2025 Curly Pottery, Inc. All rights reserved.</span>
          <span>Created by Luis Gameiro</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
