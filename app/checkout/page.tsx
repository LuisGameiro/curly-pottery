import CheckouClient from "../../components/checkout/CheckouClient";

export const metadata = {
  title: "Checkout - Curly Pottery",
  description:
    "Complete your purchase at Curly Pottery by providing your shipping information, selecting a shipping method, and making a secure payment. Enjoy a seamless shopping experience with us.",
};

export default function CheckoutPage() {
  return <CheckouClient />;
}
