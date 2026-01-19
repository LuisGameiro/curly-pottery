import { Button, Input, Text } from "@components/ui";
import { UserWithOrdersAddress } from "@lib/types/types";
import { getUserById } from "actions/customer.actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface InformationFormProps {
  onComplete: (formData: FormData) => void;
  userId?: string;
  isLoggedIn: boolean;
}

export default function InformationForm({
  onComplete,
  userId,
  isLoggedIn,
}: InformationFormProps) {
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  const [initialData, setInitialData] = useState<UserWithOrdersAddress>();

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && userId) {
        const response = await getUserById(userId);
        if (response.data) setInitialData(response.data);
      }
    };
    fetchData();
  }, [isLoggedIn, userId]);

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
        onComplete(data as unknown as FormData);
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
            defaultValue={initialData?.email || ""}
            required
          />
          <Input
            title="Phone"
            type="phone"
            name="phone"
            placeholder="Phone"
            defaultValue={initialData?.phone || ""}
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading" className="text-xl">
          Shipping Address
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            placeholder="First Name"
            defaultValue={initialData?.firstName || ""}
            required
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            defaultValue={initialData?.lastName || ""}
            required
          />
          <div className="col-span-2">
            <Input
              name="address"
              placeholder="Address"
              defaultValue={initialData?.addresses[0]?.address || ""}
              required
            />
          </div>

          <Input
            name="city"
            placeholder="City"
            defaultValue={initialData?.addresses[0]?.city || ""}
            required
          />
          <Input
            name="postcode"
            placeholder="Postcode"
            defaultValue={initialData?.addresses[0]?.postalCode || ""}
            required
          />
          <Input
            name="country"
            placeholder="Country"
            disabled
            required
            defaultValue={initialData?.addresses[0]?.country || ""}
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
