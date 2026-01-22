import CartClient from "../../components/cart/CartClient";

export const metadata = {
  title: "Cart - Curly Pottery",
  description:
    "Review the items in your Curly Pottery shopping cart before proceeding to checkout. Enjoy a seamless shopping experience with us.",
};

export default function CartPage() {
  return (
    <div className="p-10">
      <CartClient />
    </div>
  );
}
