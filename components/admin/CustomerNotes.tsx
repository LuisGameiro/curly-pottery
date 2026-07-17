'use client'

import { Button } from '@components/ui'
import InputTextArea from '@components/ui/Input/InputTextArea'
import { updateNotes } from '@actions/customer.actions'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface CustomerNotesProps {
  initialNotes: string
  customerId: string
}

const CustomerNotes = ({ initialNotes, customerId }: CustomerNotesProps) => {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await updateNotes(customerId, notes)

      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success('Notes saved')
      }
    } catch {
      toast.error('A connection error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <InputTextArea
        placeholder="No internal notes for this customer"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={isSaving ? 'opacity-50 pointer-events-none' : ''}
      />
      <Button type="submit" disabled={isSaving} variant="slim" className="mt-2">
        Save Notes
      </Button>

      <p className="text-muted mt-1">{isSaving ? 'Saving...' : ''}</p>
    </form>
  )
}

export default CustomerNotes
