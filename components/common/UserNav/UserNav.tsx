"use client";

import s from "./UserNav.module.css";
import { useUI } from "@components/ui/context";
import React from "react";
import { Button } from "@components/ui";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@lib/utils";
import useCart from "@lib/hooks/useCart";
import { Delete, Menu, ShoppingBasket } from "lucide-react";
import Link from "next/link";

const UserNav: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { data: session, status } = useSession();

  const { data, deleteAll } = useCart();
  // const { data: isCustomerLoggedIn } = useCustomer()
  const { setSidebarView, openSidebar } = useUI();
  const itemsCount = data?.lineItems.length ?? 0;
  // const DropdownTrigger = isCustomerLoggedIn
  //   ? DropdownTriggerInst
  //   : React.Fragment;

  return (
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className={s.item}>
          <Link href="/cart">
            <Button
              className={s.item}
              variant="naked"
              aria-label={`Cart items: ${itemsCount}`}
            >
              <ShoppingBasket />
              {itemsCount > 0 && (
                <span className={s.bagCount}>{itemsCount}</span>
              )}
            </Button>
          </Link>
          <Button
            className={s.item}
            variant="naked"
            onClick={deleteAll}
            aria-label={`Cart items: ${itemsCount}`}
          >
            <Delete />
            {itemsCount > 0 && <span className={s.bagCount}>{itemsCount}</span>}
          </Button>
        </li>
        <li className={s.item}>
          {/* <Dropdown>
            <DropdownTrigger>
              <button
                aria-label="Menu"
                className={s.avatarButton}
                onClick={() => (isCustomerLoggedIn ? null : openModal())}
              >
                <Avatar />
              </button>
            </DropdownTrigger>
            <CustomerMenuContent />
          </Dropdown> */}
        </li>
        <div className="flex gap-4">
          {status === "authenticated" ? (
            <>
              {/* Show Admin Link only if role is ADMIN */}
              {session.user.role === "ADMIN" && (
                <Button href="/admin" variant="ghost">
                  Admin Panel
                </Button>
              )}

              <Button href="/profile" variant="naked">
                My Account
              </Button>

              <Button color="danger" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
        <li className={s.mobileMenu}>
          <Button
            className={s.item}
            aria-label="Menu"
            variant="naked"
            onClick={() => {
              setSidebarView("MOBILE_MENU_VIEW");
              openSidebar();
            }}
          >
            <Menu />
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default UserNav;
