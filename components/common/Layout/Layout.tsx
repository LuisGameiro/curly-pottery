"use client";

import dynamic from "next/dynamic";
import { useUI } from "@components/ui/context";
import { Navbar, Footer } from "@components/common";
import { useAcceptCookies } from "@lib/hooks/useAcceptCookies";
import {  Button, LoadingDots } from "@components/ui";
import { MenuSidebarView } from "@components/common/UserNav";
import { Toaster } from "sonner";
import type { Link as LinkProps } from "../UserNav/MenuSidebarView";
import { useUser } from "@lib/hooks/useUser";

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
);

const dynamicProps = {
  loading: Loading,
};

const FeatureBar = dynamic(() => import("@components/common/FeatureBar"), {
  ...dynamicProps,
});

// const Modal = dynamic(() => import("@components/ui/Modal"), {
//   ...dynamicProps,
//   ssr: false,
// });

interface Props {
  children?: React.ReactNode;
}

// const ModalView: React.FC<{ modalView: string; closeModal(): any }> = ({
//   modalView,
//   closeModal,
// }) => {
//   return (
//     <Modal onClose={closeModal}>
//       {/* {modalView === 'LOGIN_VIEW' && <LoginView />} */}
//       {/* {modalView === 'SIGNUP_VIEW' && <SignUpView />}
//       {modalView === 'FORGOT_VIEW' && <ForgotPassword />} */}
//     </Modal>
//   );
// };

// const ModalUI: React.FC = () => {
//   const { displayModal, closeModal, modalView } = useUI();
//   return displayModal ? (
//     <ModalView modalView={modalView} closeModal={closeModal} />
//   ) : null;
// };

const SidebarView: React.FC<{
  sidebarView: string;
  closeSidebar(): () => void;
  links: LinkProps[];
}> = ({ sidebarView, closeSidebar, links }) => {
  return (
    <Sidebar onClose={closeSidebar}>
      {/* {sidebarView === 'CART_VIEW' && <CartSidebarView />} */}
      {/* {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
      {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
      {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />} */}
      {sidebarView === "MOBILE_MENU_VIEW" && <MenuSidebarView links={links} />}
    </Sidebar>
  );
};

const SidebarUI: React.FC<{ links: LinkProps[] }> = ({ links }) => {
  const { displaySidebar, closeSidebar, sidebarView } = useUI();
  return displaySidebar ? (
    <SidebarView
      links={links}
      sidebarView={sidebarView}
      closeSidebar={closeSidebar}
    />
  ) : null;
};

const Layout: React.FC<Props> = ({ children }) => {
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies();
  const { isAuthenticated, isAdmin } = useUser();

  // const { locale = "en-US" } = useRouter();

  let navBarlinks = [
    { label: "Shop", href: "/shop" },
    { label: "Contacts", href: "/contacts" },
  ];

  if (!isAuthenticated)
    navBarlinks = [...navBarlinks, { label: "Profile", href: "/user" }];

  if (!isAdmin)
    navBarlinks = [...navBarlinks, { label: "Admin", href: "/admin" }];

  return (
    <div>
      <Navbar links={navBarlinks} />
      <main className="bg-background w-full h-full min-h-[calc(100vh-310px)]">
        {children}
      </main>
      <Footer />
      {/* <ModalUI /> */}
      <SidebarUI links={navBarlinks} />
      <Toaster position="top-right" richColors />
      <FeatureBar
        title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
        hide={acceptedCookies}
        action={
          <Button className="mx-5" onClick={() => onAcceptCookies()}>
            Accept cookies
          </Button>
        }
      />
    </div>
  );
};

export default Layout;
