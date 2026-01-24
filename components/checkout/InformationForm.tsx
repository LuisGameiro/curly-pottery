import { Button, Input, Text } from '@components/ui'
import { getUserById } from 'actions/customer.actions'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface InformationFormProps {
  onComplete: (formData: FormData) => void
  userId?: string
  isLoggedIn: boolean
}

export default function InformationForm({
  onComplete,
  userId,
  isLoggedIn,
}: InformationFormProps) {
  const [continueAsGuest, setContinueAsGuest] = useState(false)

  const { register, setValue } = useFormContext()

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && userId) {
        const response = await getUserById(userId)
        if (response.data) {
          setValue('email', response.data.email)
          setValue('phone', response.data.phone || '')
          setValue('firstName', response.data.firstName)
          setValue('lastName', response.data.lastName)
          setValue('address,country', 'United Kingdom')
          if (response.data.addresses && response.data.addresses.length > 0) {
            setValue('address.address', response.data.addresses[0].address)
            setValue('address.city', response.data.addresses[0].city)
            setValue(
              'address.postalCode',
              response.data.addresses[0].postalCode,
            )
            setValue(
              'address.country',
              response.data.addresses[0].country || 'United Kingdom',
            )
          }
        }
      }
    }
    fetchData()
  }, [setValue, isLoggedIn, userId])

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
    )
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        onComplete(data as unknown as FormData)
      }}
    >
      <section>
        <Text variant="sectionHeading">Contact Information</Text>
        <div className="grid grid-cols-2 gap-4">
          <Input
            title="email"
            type="email"
            {...register('email', { required: true })}
            placeholder="Email Address"
          />
          <Input
            title="Phone"
            type="phone"
            {...register('phone', { required: true })}
            placeholder="Phone"
          />
        </div>
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading" className="text-xl">
          Shipping Address
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('firstName', { required: true })}
            placeholder="First Name"
          />
          <Input
            placeholder="Last Name"
            {...register('lastName', { required: true })}
          />
          <div className="col-span-2">
            <Input
              placeholder="Address"
              {...register('address.address', { required: true })}
            />
          </div>

          <Input
            placeholder="City"
            {...register('address.city', { required: true })}
          />
          <Input
            placeholder="Postal code"
            {...register('address.postalCode', { required: true })}
          />
          <Input
            placeholder="Country"
            value={'United Kingdom'}
            disabled
            {...register('address.country', { required: true })}
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
  )
}
