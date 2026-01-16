"use client";

import { useState } from "react";
import { Container, Text, Button, Input } from "@components/ui";
import { User, Mail, Phone } from "lucide-react";

export default function ProfileForm({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
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
          <Text variant="heading">Welcome, {formData.name}!</Text>

          <Button variant="slim" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </header>

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
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          ) : (
            <div className="flex items-center my-4">
              <User size={18} className="mr-2" /> {formData.name}
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
