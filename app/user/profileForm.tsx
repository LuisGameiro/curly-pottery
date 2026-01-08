'use client'

import { useState } from 'react';
import { Container, Text, Button, Input } from '@components/ui';
import { User, Mail, Phone } from 'lucide-react';

export default function ProfileForm({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    notes: user?.notes || '',
  });

  const handleSave = async () => {
    // Logic to fetch('/api/user/update') or call a Server Action
    setIsEditing(false);
    console.log("Saved data:", formData);
  };

  return (
    <Container >
      <div>
        <div className="flex items-center gap-4">
          <div className="flex w-full">

            <Text variant="heading" className="mb-0">Welcome, {formData.name}!</Text>

          </div>
          <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
          <div className="flex items-center mt-1 text-gray-600">
            <Mail size={18} className="mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div>
          <label >Full Name</label>
          {isEditing ? (
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          ) : (
            <div className="flex items-center mt-1"><User size={18} className="mr-2" /> {formData.name}</div>
          )}
        </div>

        <div>
          <label >Phone</label>
          {isEditing ? (
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          ) : (
            <div className="flex items-center mt-1"><Phone size={18} className="mr-2" /> {formData.phone || 'Not provided'}</div>
          )}
        </div>
      </div>



      {isEditing && (
        <Button width="100%" onClick={handleSave}>Save Changes</Button>
      )}
    </Container>
  );
}

