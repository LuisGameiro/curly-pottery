'use client'

import { Controller, useFormContext } from 'react-hook-form'
import {
  Container,
  Text,
  Input,
  InputTextArea,
  InputImage,
  InputCheckbox,
} from '@components/ui'
import { slugify } from '@lib/slugify'
import { Category } from '@lib/types/types'

export default function GeneralInformationSection({
  categories,
}: {
  categories: Category[]
}) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()
  const productName = watch('name')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Container variant="box" className="lg:col-span-2 space-y-">
        <Text variant="boxTitle">General Information</Text>
        <div className="space-y-4">
          <Input
            label="Product Name"
            {...register('name')}
            error={errors.name?.message as string}
            type="text"
            placeholder="e.g. vase"
          />

          <div className="gap-2">
            <span className=" font-semibold mr-2">Slug: </span>
            <span>{'/' + slugify(productName || '')} </span>
          </div>

          <InputTextArea
            label="Description"
            className="flex h-40"
            error={errors.description?.message as string}
            {...register('description')}
            placeholder="e.g. vase dedcor description"
          />
        </div>
      </Container>

      <div className="space-y-6">
        <Container variant="box">
          <Text variant="boxTitle">Organization</Text>
          <div className="space-y-4">
            <InputCheckbox
              label="Hide product from store"
              {...register('hide')}
            />

            <InputCheckbox
              label="Requires Shipping"
              {...register('requiresShipping')}
            />
            <div>
              <label>Categories</label>
              <Controller
                name="categoryIds"
                control={control}
                rules={{
                  validate: (val) =>
                    val.length > 0 || 'Select at least one category',
                }}
                render={({ field }) => (
                  <div
                    className={`flex flex-wrap gap-2 mt-2 ${errors?.categoryIds ? 'border border-red/60' : ''}`}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const current = field.value
                          const next = current.includes(cat.id)
                            ? current.filter((id: string) => id !== cat.id)
                            : [...current, cat.id]
                          field.onChange(next)
                        }}
                        className={`px-3 py-1 rounded-full text-xs border transition ${
                          field.value.includes(cat.id)
                            ? 'bg-primary text-secondary border-primary hover:bg-primary/60'
                            : 'bg-muted/60 text-secondary hover:bg-muted/20'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors?.categoryIds && (
                <Text variant="error" role="alert">
                  {errors.categoryIds.message as string}
                </Text>
              )}
            </div>
          </div>
        </Container>

        <Container variant="box">
          <Text variant="boxTitle">Product Image</Text>
          <Controller
            name="files"
            control={control}
            render={({ field: { onChange, value } }) => (
              <InputImage
                multiple={false}
                files={value}
                previews={watch('previews')}
                onImagesChange={({ files, previews }) => {
                  onChange(files)
                  setValue('previews', previews)
                }}
                error={errors.files?.message as string}
              />
            )}
          />
        </Container>
      </div>
    </div>
  )
}
