"use client";

import cn from "clsx";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import s from "./CustomerMenuContent.module.css";
import {
  DropdownContent,
  DropdownMenuItem,
} from "@components/ui/Dropdown/Dropdown";
import { Moon, Sun } from "lucide-react";
import { useUser } from "@lib/hooks/useUser";

const LINKS = [
  {
    name: "Shop",
    href: "/shop",
  },
  {
    name: "Contact Us",
    href: "/contacts",
  },
];

export default function CustomerMenuContent() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useUser();

  const pathname = params?.slug ? `/${params.slug}` : "/";
  const { theme, setTheme } = useTheme();

  function handleClick(_: React.MouseEvent<HTMLAnchorElement>, href: string) {
    router.push(href);
  }

  function logout(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <DropdownContent
      sideOffset={10}
      id="CustomerMenuContent"
      className="border-2 border-secondary rounded-md shadow-2xl"
    >
      {LINKS.map(({ name, href }) => (
        <DropdownMenuItem key={href}>
          <a
            className={cn(s.link, {
              [s.active]: pathname === href,
            })}
            onClick={(e) => handleClick(e, href)}
          >
            {name}
          </a>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem>
        <a
          className={cn(s.link, "justify-between")}
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          <div>
            Theme: <strong>{theme}</strong>{" "}
          </div>
          <div className="ml-3">
            {theme == "dark" ? (
              <Moon width={20} height={20} />
            ) : (
              <Sun width={20} height={20} />
            )}
          </div>
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem>
        {isAuthenticated ? (
          <div
            className={cn(s.link, "border-t border-secondary mt-4 flex-col")}
          >
            {isAdmin && (
              <a
                className={s.link}
                onClick={() => handleClick(event as any, "/admin")}
              >
                Admin
              </a>
            )}
            <a
              className={s.link}
              onClick={() => handleClick(event as any, "/user")}
            >
              My Account
            </a>

            <a className={s.link} onClick={() => logout()}>
              Logout
            </a>
          </div>
        ) : (
          <a
            className={cn(s.link, "border-t border-accent-2 mt-4")}
            onClick={() => handleClick(event as any, "/auth/login")}
          >
            Login
          </a>
        )}
      </DropdownMenuItem>
    </DropdownContent>
  );
}
