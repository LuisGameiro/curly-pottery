"use client";

import s from "./UserNav.module.css";
import { Button, Dropdown, DropdownTrigger } from "@components/ui";
import { signOut } from "next-auth/react";
import { cn } from "@lib/utils";
import useCart from "@lib/hooks/useCart";
import { Menu, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useUser } from "@lib/hooks/useUser";
import CustomerMenuContent from "./CustomerMenuContent";

type UserNavProps = {
  className?: string;
}

export default function UserNav({ className }: UserNavProps) {
  const { isAdmin, isAuthenticated } = useUser();

  const { data, deleteAll } = useCart();
  const itemsCount = data?.lineItems.length ?? 0;

  return (
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className="hidden gap-4 md:block">
          {isAuthenticated ? (
            <div>
              <Link href="/admin">
                {isAdmin && <Button variant="naked">Admin Panel</Button>}
              </Link>
              <Link href="/user">
                <Button variant="naked">My Account</Button>
              </Link>
              <Button color="danger" variant="naked" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="naked">Login</Button>
            </Link>
          )}
        </li>
        <li className={s.item}>
          <Link href="/cart">
            <Button
              className={s.item}
              variant="naked"
              aria-label={`Cart items: ${itemsCount}`}
            >
              <ShoppingBasket size={28} />
              {itemsCount > 0 && (
                <span className={s.bagCount}>{itemsCount}</span>
              )}
            </Button>
          </Link>
        </li>

        <li className={s.mobileMenu}>
          <Dropdown>
            <DropdownTrigger id='user-nav-mobile-trigger'>
              <Menu size={28} />
            </DropdownTrigger>
            <CustomerMenuContent />
          </Dropdown>
        </li>
      </ul>
    </nav>
  );
};

UserNav.displayName="UserNav";