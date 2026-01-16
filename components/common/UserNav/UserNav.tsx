"use client";

import s from "./UserNav.module.css";
import { Avatar } from "@components/common";
// import useCart from '@framework/cart/use-cart'
import { useUI } from "@components/ui/context";
import { Heart, Bag, Menu } from "@components/icons";
import CustomerMenuContent from "./CustomerMenuContent";
// import useCustomer from '@framework/customer/use-customer'
import React from "react";
import {
  Dropdown,
  DropdownTrigger as DropdownTriggerInst,
  Button,
} from "@components/ui";

import type { LineItem } from "@lib/types/inspiration/cart";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "@lib/utils";
import useCart from "@lib/hooks/useCart";
import { Delete } from "lucide-react";
import Link from "next/link";

const countItem = (count: number, item: LineItem) => count + item.quantity;

const UserNav: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { data: session, status } = useSession();

  const { data, deleteAll } = useCart();
  // const { data: isCustomerLoggedIn } = useCustomer()
  const { closeSidebarIfPresent, openModal, setSidebarView, openSidebar } =
    useUI();
  const itemsCount = data?.lineItems?.reduce(countItem, 0) ?? 0;
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
              <Bag />
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
