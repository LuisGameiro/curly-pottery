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
const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null); 

    try {
      const result = await updateNotes(customerId, notes);

      if (!result.success) {
        setErrorMessage(result.message);
        toast.error(result.message); 
      } else {
        toast.success("Notes saved");
      }
    } catch (error) {
      setErrorMessage("A connection error occurred. Please try again.");
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
