import { Button, Input, Text } from "@components/ui";

export default function InformationForm({ onComplete, isGuest, initialData }: any) {
    return (
        <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            onComplete(Object.fromEntries(data));
        }}>
            <section>
                <Text variant='sectionHeading'>Contact Information</Text>
                <div className="grid grid-cols-2 gap-4">

                    <Input
                        title='email'
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        defaultValue={initialData?.email}
                        required
                    />
                    <Input
                        title='phone'
                        type="phone"
                        name="phone"
                        placeholder="phone"
                        defaultValue={initialData?.email}
                        required
                    />
                </div>
                {isGuest && <p className="text-xs mt-2 text-accent-5">Checking out as a guest? You can create an account later.</p>}
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name"  required />
                    <Input name="lastName" placeholder="Last Name"  required />
                    <input name="address" placeholder="Address" className="col-span-2  border p-2" required />
                    <Input name="city" placeholder="City"  required />
                    <Input name="postcode" placeholder="Postcode"  required />
                </div>
            </section>

            <Button type="submit" variant='secondary'>
                Continue to Shipping
            </Button>
        </form>
    );
}