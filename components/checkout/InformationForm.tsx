import { Button, Input, Text } from '@components/ui'
import { getUserById } from 'actions/customer.actions'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useFormContext, FieldErrors } from 'react-hook-form'
import { validateUKPostcode } from '@lib/address-validation'

interface InformationFormProps {
  onComplete: () => void
  userId?: string
  isLoggedIn: boolean
}

export default function InformationForm({
  onComplete,
  userId,
  isLoggedIn,
}: InformationFormProps) {
  const [continueAsGuest, setContinueAsGuest] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useFormContext()

  const addressErrors = errors.address as
    | FieldErrors<{
        address: string
        city: string
        postalCode: string
      }>
    | undefined

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn && userId) {
        const response = await getUserById(userId)
        if (response.data) {
          setValue('email', response.data.email)
          setValue('phone', response.data.phone || '')
          setValue('firstName', response.data.firstName)
          setValue('lastName', response.data.lastName)
          setValue('address.country', 'United Kingdom')
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

  const onSubmit = async () => {
    setIsValidating(true)
    const postalCode = (
      document.querySelector(
        'input[name="address.postalCode"]',
      ) as HTMLInputElement
    )?.value
    const isPostcodeValid = await validateUKPostcode(postalCode)

    if (!isPostcodeValid) {
      // Manually set error if needed, but better to use register validation
      setIsValidating(false)
      return
    }

    setIsValidating(false)
    onComplete()
  }

  if (!isLoggedIn && !continueAsGuest) {
    return (
      <div className="flex-center flex-col space-y-6">
        <div className="text-center space-y-2">
          <Text variant="sectionHeading">Already have an account?</Text>
          <Text className=" text-muted">
            Log in for a faster checkout experience.
          </Text>
        </div>

        <div className="flex flex-col w-full max-w-xs space-y-4">
          <Link href="auth/login?redirect=/checkout" className="w-full">
            <Button className="w-full">Sign In</Button>
          </Link>

          <div className="relative flex py-2 items-center">
            <div className="flex-1 border-t border-border"></div>
            <Text className=" mx-4 text-muted  uppercase">Or</Text>
            <div className="flex-1 border-t border-border"></div>
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
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <section>
        <Text variant="sectionHeading">Contact Information</Text>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input
              title="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="Email Address"
            />
            {errors.email && (
              <Text variant="error" className="text-xs ml-1">
                {errors.email.message as string}
              </Text>
            )}
          </div>
          <div className="space-y-1">
            <Input
              title="Phone"
              type="phone"
              {...register('phone', { required: 'Phone is required' })}
              placeholder="Phone"
            />
            {errors.phone && (
              <Text variant="error" className="text-xs ml-1">
                {errors.phone.message as string}
              </Text>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Text variant="sectionHeading" className="text-xl">
          Shipping Address
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input
              {...register('firstName', { required: 'First name is required' })}
              placeholder="First Name"
            />
            {errors.firstName && (
              <Text variant="error" className="text-xs ml-1">
                {errors.firstName.message as string}
              </Text>
            )}
          </div>
          <div className="space-y-1">
            <Input
              placeholder="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && (
              <Text variant="error" className="text-xs ml-1">
                {errors.lastName.message as string}
              </Text>
            )}
          </div>
          <div className="col-span-2 space-y-1">
            <Input
              placeholder="Address"
              {...register('address.address', {
                required: 'Address is required',
              })}
            />
            {addressErrors?.address && (
              <Text variant="error" className="text-xs ml-1">
                {addressErrors.address.message}
              </Text>
            )}
          </div>

          <div className="space-y-1">
            <Input
              placeholder="City"
              {...register('address.city', { required: 'City is required' })}
            />
            {addressErrors?.city && (
              <Text variant="error" className="text-xs ml-1">
                {addressErrors.city.message}
              </Text>
            )}
          </div>
          <div className="space-y-1">
            <Input
              placeholder="Postal code"
              {...register('address.postalCode', {
                required: 'Postal code is required',
                validate: async (value) =>
                  (await validateUKPostcode(value)) || 'Invalid UK postal code',
              })}
            />
            {addressErrors?.postalCode && (
              <Text variant="error" className="text-xs ml-1">
                {addressErrors.postalCode.message}
              </Text>
            )}
          </div>
          <Input
            placeholder="Country"
            value={'United Kingdom'}
            disabled
            {...register('address.country', { required: true })}
          />
        </div>
        <Text variant="muted" className="text-sm">
          Currently we only ship for uk, if you are outside the uk please
          contact us directly for us to try to help you how to send you the
          required products.
        </Text>
      </section>

      <Button
        type="submit"
        variant="secondary"
        className="w-full sm:w-auto"
        loading={isValidating}
      >
        Continue to Shipping
      </Button>
    </form>
  )
}
