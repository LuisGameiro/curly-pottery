import { Button, Input, Text } from '@components/ui'
import { getUserById } from '@actions/customer.actions'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useFormContext, FieldErrors } from 'react-hook-form'
import { validateUKPostcode } from '@lib/address-validation'
import { ChevronDown } from 'lucide-react'

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
    getValues,
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
    const postalCode = getValues('address.postalCode') as string
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
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      data-testid="info-form"
    >
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
            <div className="flex border border-border rounded-lg bg-background focus-within:ring-1 focus-within:ring-secondary transition-all overflow-hidden h-[42px]">
              <div className="flex items-center gap-1 pl-3 pr-2 border-r border-border bg-accent/5">
                <span className="text-lg leading-none">🇬🇧</span>
                <select
                  className="bg-transparent text-sm font-bold focus:outline-hidden appearance-none cursor-pointer pl-1 pr-0"
                  {...register('countryCode')}
                >
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+33">+33</option>
                  <option value="+49">+49</option>
                </select>
                <ChevronDown size={14} className="text-muted ml-1" />
              </div>
              <input
                type="tel"
                className="flex-1 bg-transparent px-3 py-2 focus:outline-hidden text-sm"
                placeholder="07400 123456"
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: {
                    value:
                      /^(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|#)\d{3,4})?$/i,
                    message: 'Please provide a valid phone number.',
                  },
                })}
              />
            </div>
            {errors.phone && (
              <Text variant="error" className="text-xs ml-1 text-red">
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
                onBlur: async (e) => {
                  const val = e.target.value
                  if (val && (await validateUKPostcode(val))) {
                    try {
                      const res = await fetch(
                        `https://api.postcodes.io/postcodes/${val.replace(/\s/g, '')}`,
                      )
                      const data = await res.json()
                      if (
                        data.result &&
                        (data.result.admin_district ||
                          data.result.primary_care_trust ||
                          data.result.parish)
                      ) {
                        setValue(
                          'address.city',
                          data.result.admin_district ||
                            data.result.primary_care_trust ||
                            data.result.parish,
                          { shouldValidate: true },
                        )
                      }
                    } catch (err) {
                      console.error('Postcode auto-fill error:', err)
                    }
                  }
                },
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
          Currently we only ship for UK, if you are outside the UK please
          contact us directly and check with us for any other available shops.
        </Text>
      </section>

      {!isLoggedIn && (
        <section className="space-y-4 pt-4 border-t border-border">
          <Text variant="sectionHeading" className="text-xl">
            Save Details for Next Time?
          </Text>
          <div className="space-y-1 max-w-sm">
            <Input
              type="password"
              placeholder="Create a password (Optional)"
              {...register('password')}
            />
            <Text variant="muted" className="text-xs">
              Enter a password to securely save your information for a faster
              checkout next time.
            </Text>
          </div>
        </section>
      )}

      <Button
        type="submit"
        variant="secondary"
        className="w-full sm:w-auto"
        loading={isValidating}
      >
        Continue to Payment
      </Button>
    </form>
  )
}
