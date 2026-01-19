"use client";

import { useState } from "react";
import { Container, Text, Button, Input } from "@components/ui";
import { Mail, Phone, UserIcon } from "lucide-react";
import { User } from "@lib/types/types";
import { useUser } from "@lib/hooks/useUser";

export default function ProfileForm({ user }: { user: User }) {
  const { isAdmin, user: u } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",

    phone: user?.phone || "",
    company: user?.company || "",
    notes: user?.notes || "",
  });

  const handleSave = async () => {
    setIsEditing(false);
    console.log("Saved data:", formData);
  };

  return (
    <Container>
      <header>
        <div className="w-full flex flex-row justify-between">
          <Text variant="heading">Welcome, {formData.firstName}!</Text>

          <Button variant="slim" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </header>

      <p>
        {isAdmin
          ? "As an admin, you have full access to manage the platform."
          : "Manage your personal information and settings below."}
        {u?.role}
      </p>

      <section className=" space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">
            Email
          </label>
          <div className="flex items-center mt-1 text-gray-600">
            <Mail size={18} className="mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div>
          <label>Full Name</label>
          {isEditing ? (
            <>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </>
          ) : (
            <div className="flex items-center my-4">
              <UserIcon size={18} className="mr-2" /> {formData.firstName}{" "}
              {formData.lastName}
            </div>
          )}
        </div>

        <div>
          <label>Phone</label>
          {isEditing ? (
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          ) : (
            <div className="flex items-center my-4">
              <Phone size={18} className="mr-2" />{" "}
              {formData.phone || "Not provided"}
            </div>
          )}
        </div>

        {isEditing && (
          <Button width="100%" variant="slim" onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </section>
    </Container>
  );
}
