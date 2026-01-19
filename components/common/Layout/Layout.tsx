"use client";

import dynamic from "next/dynamic";
import { Navbar, Footer } from "@components/common";
import { useAcceptCookies } from "@lib/hooks/useAcceptCookies";
import { Button, LoadingDots } from "@components/ui";
// import { MenuSidebarView } from "@components/common/UserNav";
import { Toaster } from "sonner";

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
);

const dynamicProps = {
  loading: Loading,
  ssr: false,
};

const FeatureBar = dynamic(() => import("@components/common/FeatureBar"), {
  ...dynamicProps,
});

interface Props {
  children?: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies();

  const navBarlinks = [
    { label: "Shop", href: "/shop" },
    { label: "Contacts", href: "/contacts" },
  ];

  return (
    <div>
      <Navbar links={navBarlinks} />
      <main className="bg-background w-full h-full min-h-[calc(100vh-310px)]">
        {children}
      </main>
      <Footer />
      {/* <ModalUI /> */}
      {/* <SidebarUI links={navBarlinks} /> */}
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
}

// const Modal = dynamic(() => import("@components/ui/Modal"), {
//   ...dynamicProps,
//   ssr: false,
// });

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

// const SidebarView: React.FC<{
//   sidebarView: string;
//   closeSidebar(): () => void;
//   links: LinkProps[];
// }> = ({ sidebarView, closeSidebar, links }) => {
//   return (
//     <Sidebar onClose={closeSidebar}>
//       {/* {sidebarView === 'CART_VIEW' && <CartSidebarView />} */}
//       {/* {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
//       {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
//       {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />} */}
//       {sidebarView === "MOBILE_MENU_VIEW" && <MenuSidebarView links={links} />}
//     </Sidebar>
//   );
// };

// const SidebarUI: React.FC<{ links: LinkProps[] }> = ({ links }) => {
//   const { displaySidebar, closeSidebar, sidebarView } = useUI();
//   return displaySidebar ? (
//     <SidebarView
//       links={links}
//       sidebarView={sidebarView}
//       closeSidebar={closeSidebar}
//     />
//   ) : null;
// };
