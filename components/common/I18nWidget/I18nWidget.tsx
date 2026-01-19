"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import s from "./I18nWidget.module.css";
import ClickOutside from "@lib/click-outside";
import Image from "next/image";
import { cn } from "@lib/utils";
import { ChevronRight } from "lucide-react";

interface LOCALE_DATA {
  name: string;
  img: {
    filename: string;
    alt: string;
  };
}

const LOCALES_MAP: Record<string, LOCALE_DATA> = {
  es: {
    name: "Español",
    img: {
      filename: "flag-es-co.svg",
      alt: "Bandera española",
    },
  },
  "en-UK": {
    name: "English",
    img: {
      filename: "flag-en-uk.svg",
      alt: "Uk Flag",
    },
  },
};

export const i18n = {
  defaultLocale: "en",
  locales: ["en", "de", "fr", "es"],
} as const;
type Locale = (typeof i18n)["locales"][number];
const I18nWidget = () => {
  const [display, setDisplay] = useState(false);
  const params = useParams();
  const locale = params.locale as Locale;

  const locales = i18n.locales;
  const defaultLocale = i18n.defaultLocale;
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const currentLocale = "en-UK"; //locale || defaultLocale;
  const options = null; //locales.filter((val) => val !== currentLocale);

  return (
    <ClickOutside active={display} onClick={() => setDisplay(false)}>
      <nav className={s.root}>
        <div
          className="flex items-center relative"
          onClick={() => setDisplay(!display)}
        >
          <button className={s.button} aria-label="Language selector">
            <Image
              width="20"
              height="20"
              className="block"
              src={`/${LOCALES_MAP[currentLocale].img.filename}`}
              alt={LOCALES_MAP[currentLocale].img.alt}
              unoptimized
            />
            {options && (
              <span className="cursor-pointer ml-1">
                <ChevronRight className={cn(s.icon, { [s.active]: display })} />
              </span>
            )}
          </button>
        </div>

        {/* <div className="absolute top-0 right-0">
          {!!options && display ? (
            <div className={s.dropdownMenu}>
              <div className="flex flex-row justify-end px-6">
                <button
                  onClick={() => setDisplay(false)}
                  aria-label="Close panel"
                  className={s.closeButton}
                >
                  <Cross className="h-6 w-6" />
                </button>
              </div>
              <ul>
                {options.map((locale: string) => (
                  <li key={locale}>
                    <Link
                      href={currentPath}
                      locale={locale}
                      className={cn(s.item)}
                      onClick={() => setDisplay(false)}
                    >
                      {LOCALES_MAP[locale].name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div> */}
      </nav>
    </ClickOutside>
  );
};

export default I18nWidget;
