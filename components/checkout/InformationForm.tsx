import { Button, Input, Text } from "@components/ui";
import { Cart, User } from "@lib/types/types";
import Link from "next/link";
import { useState } from "react";

interface InformationFormProps {
  onComplete: (formData: any) => void
  initialData: User,
  isLoggedIn: boolean,

}

export default function InformationForm({
  onComplete,
  initialData,
  isLoggedIn,
}: InformationFormProps) {
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  if (!isLoggedIn && !continueAsGuest) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <Text variant="sectionHeading">Already have an account?</Text>
          <Text className=" text-accent-6">
            Log in for a faster checkout experience.
          </Text>
        </div>

        <div className="flex flex-col w-full max-w-xs space-y-4">
          <Link href="auth/login?redirect=/checkout" className="w-full">
            <Button className="w-full">Sign In</Button>
          </Link>

          <div className="relative flex py-2 items-center">
            <div className="flex-1 border-t border-accent-2"></div>
            <Text className=" mx-4 text-accent-4  uppercase">Or</Text>
            <div className="flex-1 border-t border-accent-2"></div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setContinueAsGuest(true)}
            className="w-full"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onComplete(Object.fromEntries(data));
      }}
    >
      <section>
        <Text variant="sectionHeading">Contact Information</Text>
        <div className="grid grid-cols-2 gap-4">
          <Input
            title="email"
            type="email"
            name="email"
            placeholder="Email Address"
            defaultValue={initialData?.email || ''}
            required
          />
          <Input
            title="Phone"
            type="phone"
            name="phone"
            placeholder="Phone"
            defaultValue={initialData?.phone || ''}
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading" className="text-xl">
          Shipping Address
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <Input name="firstName" placeholder="First Name" required />
          <Input name="lastName" placeholder="Last Name" required />
          <div className="col-span-2">
            <Input name="address" placeholder="Address" required />
          </div>

          <Input name="city" placeholder="City" required />
          <Input name="postcode" placeholder="Postcode" required />
          <Input
            name="country"
            placeholder="Country"
            disabled
            required
            value={"United Kingdown"}
          />
        </div>
        <Text>
          Currently we only ship for uk, if you are outside the uk please
          contact us directly for us to try to help you how to send you the
          required products.
        </Text>
      </section>

      <Button type="submit" variant="secondary">
        Continue to Shipping
      </Button>
    </form>
  );
}
