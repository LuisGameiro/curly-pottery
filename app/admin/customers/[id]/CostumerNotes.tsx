"use client";

import InputTextArea from "@components/ui/Input/InputTextArea";
import { updateNotes } from "actions/customer.actions";
import React, { useState } from "react";

interface CustomerNotesProps {
  initialNotes: string;
  customerId: string;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({
  initialNotes,
  customerId,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateNotes(customerId, notes);
    } catch (error) {
      console.error("Failed to update notes", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <InputTextArea
        placeholder="No internal notes for this customer"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={isSaving ? "opacity-50 pointer-events-none" : ""}
      />

      <p className="text-[10px] text-slate-400 mt-1">
        {isSaving ? "Saving..." : "Press Enter to save notes"}
      </p>
    </form>
  );
};

export default CustomerNotes;
