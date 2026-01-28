'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Container, Text, Button, Input } from '@components/ui'
import { Mail, MapPin, Phone, Plus, Trash2, UserIcon } from 'lucide-react'
import { Address, UserWithOrdersAddress } from '@lib/types/types'
import { toast } from 'sonner'
import { updateUser } from 'actions/customer.actions'

export default function ProfileForm({ user }: { user: UserWithOrdersAddress }) {
  const [isEditing, setIsEditing] = useState(false)

  const { register, control, handleSubmit, reset, watch } =
    useForm<UserWithOrdersAddress>({
      defaultValues: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        addresses: user?.addresses || [],
      },
    })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  useEffect(() => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      addresses: user?.addresses || [],
    })
  }, [user, reset])

  const onSubmit = async (data: UserWithOrdersAddress) => {
    try {
      const response = await updateUser(user.id, data)

      if (response.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsEditing(false)
    }
  }

  const toggleEditing = () => {
    if (!isEditing && fields.length === 0) {
      append({
        address: '',
        city: '',
        postalCode: '',
        country: 'United Kingdom',
      } as Address)
    }
    setIsEditing(!isEditing)
  }

  const watchedName = watch('firstName')

  return (
    <Container>
      <header className="mb-8">
        <div className="w-full flex flex-row justify-between items-center">
          <Text variant="heading">Welcome, {watchedName}!</Text>
          <Button variant="slim" onClick={toggleEditing}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="text-sm font-semibold">Email</label>
          <div className="flex items-center mt-1 text-muted">
            <Mail size={18} className="mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Full Name</label>
          {isEditing ? (
            <div className="gap-2 grid grid-cols-2 py-2">
              <Input
                {...register('firstName', { required: true })}
                placeholder="First Name"
              />
              <Input
                {...register('lastName', { required: true })}
                placeholder="Last Name"
              />
            </div>
          ) : (
            <div className="flex items-center pt-2 pb-2">
              <UserIcon size={18} className="mr-2" />
              {watch('firstName')} {watch('lastName')}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold">Phone</label>
          {isEditing ? (
            <div className="py-2">
              <Input {...register('phone')} placeholder="Phone Number" />
            </div>
          ) : (
            <div className="flex items-center py-2">
              <Phone size={18} className="mr-2" />
              {watch('phone') || 'Not provided'}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <Text variant="subHeading">Your Addresses</Text>
            {isEditing && (
              <Button
                type="button"
                variant="naked"
                onClick={() =>
                  append({
                    address: '',
                    city: '',
                    postalCode: '',
                    country: 'United Kingdom',
                  } as Address)
                }
                className="flex items-center text-secondary"
              >
                <Plus size={16} className="mr-1" /> Add Address
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {fields.length === 0 && !isEditing && (
              <Text className="text-muted italic">No addresses saved.</Text>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg relative bg-background "
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text className="font-bold text-sm">
                        Address #{index + 1}
                      </Text>
                      <Button
                        type="button"
                        variant="naked"
                        onClick={() => remove(index)}
                        className="text-red"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <Input
                      placeholder="Address"
                      {...register(`addresses.${index}.address` as const, {
                        required: true,
                      })}
                    />

                    <div className="gap-2 grid grid-cols-2">
                      <Input
                        placeholder="City"
                        {...register(`addresses.${index}.city` as const, {
                          required: true,
                        })}
                      />
                      <Input
                        placeholder="Postal Code"
                        {...register(`addresses.${index}.postalCode` as const, {
                          required: true,
                        })}
                      />
                    </div>

                    <div className="items-center gap-2 grid grid-cols-2">
                      <Input value="United Kingdom" disabled />
                      <Text className="text-xs text-muted">
                        Currently only shipping to UK.
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 mt-1 text-muted" />
                    <div>
                      <Text className="font-medium">
                        {watch(`addresses.${index}.address`) || 'New Address'}
                      </Text>
                      <Text className="text-muted">
                        {watch(`addresses.${index}.postalCode`)},{' '}
                        {watch(`addresses.${index}.city`)}{' '}
                        {watch(`addresses.${index}.country`)}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <Button type="submit" width="100%" variant="slim" className="mt-6">
            Save Changes
          </Button>
        )}
      </form>
    </Container>
  )
}
