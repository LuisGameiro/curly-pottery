"use client";

import { FC, useState, useEffect, ReactNode, useRef } from "react";
import throttle from "lodash.throttle";
import s from "./Navbar.module.css";
import { cn } from "@lib/utils";

const NavbarRoot = (
  {
    children
  }: {
    children?: ReactNode;
  }
) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollTop = document.documentElement.scrollTop;

      setHasScrolled(scrollTop > 0);

      if (scrollTop > lastScrollTop.current && scrollTop > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollTop.current = scrollTop;
    }, 200);

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, []);

  return (
    <div
      className={cn(
        s.root,
        { "shadow-magical": hasScrolled },
        { [s.hidden]: hidden },
      )}
    >
      {children}
    </div>
  );
};

export default NavbarRoot;
