"use client";

import { useState } from "react";
import { Container, Text, Button, Input } from "@components/ui";
import { Mail, MapPin, Phone, Plus, Trash2, UserIcon } from "lucide-react";
import { UserWithOrdersAddress } from "@lib/types/types";
import { useUser } from "@lib/hooks/useUser";

export default function ProfileForm({ user }: { user: UserWithOrdersAddress }) {
  const { isAdmin, user: u } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",

    phone: user?.phone || "",
    company: user?.company || "",
    notes: user?.notes || "",
    addresses: user?.addresses || [],
  });

  // 2. Helper to add a new empty address
  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        {
          address: "",
          city: "",
          postalCode: "",
          id: "",
          company: null,
          createdAt: new Date(),
          type: null,
          country: "United Kingdom",
          userId: null,
        },
      ],
    });
  };

  // 3. Helper to update specific address fields
  const updateAddress = (index: number, field: string, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  // 4. Helper to remove an address
  const removeAddress = (index: number) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };
  const handleSave = async () => {
    setIsEditing(false);
    console.log("Saved data:", formData);
  };

  const EditingButton = () => {
    setIsEditing(!isEditing);
    if (formData.addresses.length === 0) addAddress();
  };

  return (
    <Container>
      <header>
        <div className="w-full flex flex-row justify-between">
          <Text variant="heading">Welcome, {formData.firstName}!</Text>

          <Button variant="slim" onClick={EditingButton}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </header>

      <section>
        <div>
          <label>Email</label>
          <div className="flex items-center mt-1 text-accent-9">
            <Mail size={18} className="mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="mt-6">
          <label>Full Name</label>
          {isEditing ? (
            <div className="gap-2 grid grid-cols-2 py-2">
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
            </div>
          ) : (
            <div className="flex items-center pt-4 pb-4">
              <UserIcon size={18} className="mr-2" /> {formData.firstName}{" "}
              {formData.lastName}
            </div>
          )}
        </div>

        <div className="mt-2">
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

        <div className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <Text variant="subHeading">Your Addresses</Text>
            {isEditing && (
              <Button
                variant="naked"
                onClick={addAddress}
                className="flex items-center text-secondary"
              >
                <Plus size={16} className="mr-1" /> Add Address
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {formData.addresses.length === 0 && !isEditing && (
              <Text className="text-accent-5 italic">No addresses saved.</Text>
            )}

            {formData.addresses.map((address: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg relative">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text className="font-bold text-sm">
                        Address #{index + 1}
                      </Text>
                      <Button
                        variant="naked"
                        color="danger"
                        onClick={() => removeAddress(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <Input
                      placeholder="Address"
                      value={address.street}
                      onChange={(e) =>
                        updateAddress(index, "street", e.target.value)
                      }
                    />
                    <div className="gap-2 grid grid-cols-2">
                      <Input
                        placeholder="City"
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(index, "city", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Postal Code"
                        value={address.postalCode}
                        onChange={(e) =>
                          updateAddress(index, "postalCode", e.target.value)
                        }
                      />
                    </div>
                    <div className="items-center gap-2 grid grid-cols-2">
                      <Input
                        placeholder="Country"
                        value={address.country}
                        disabled
                        onChange={(e) =>
                          updateAddress(index, "country", e.target.value)
                        }
                      />
                      <Text> Currently we only ship to Uk.</Text>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 mt-1 text-accent-6" />
                    <div>
                      <Text>{address.street || "New Address"},</Text>
                      <Text>
                        {address.postalCode}, {address.city} {address.country}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
