import { useState } from 'react';
import { Container, Text, Button, Input } from '@components/ui';
import { User, Mail, Phone, Building, Shield } from 'lucide-react';
import UserLayout from './layout';

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
        {/* Header Section */}
        <div className="flex w-full">

          <div className="flex w-full">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.name?.charAt(0) || 'U'}
            </div>
            <Text variant="heading" className="mb-0">Welcome, {formData.name}!</Text>

          </div>
          <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>


      {/* Content Section */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Email (Non-Editable for security) */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
            <div className="flex items-center mt-1 text-gray-600">
              <Mail size={18} className="mr-2" />
              <span>{user?.email}</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
            {isEditing ? (
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            ) : (
              <div className="flex items-center mt-1"><User size={18} className="mr-2" /> {formData.name}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
            {isEditing ? (
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            ) : (
              <div className="flex items-center mt-1"><Phone size={18} className="mr-2" /> {formData.phone || 'Not provided'}</div>
            )}
          </div>


        </div>

        {/* Notes (Full Width) */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Personal Notes</label>
          {isEditing ? (
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          ) : (
            <p className="mt-1 text-gray-600 italic">{formData.notes || 'No notes added yet.'}</p>
          )}
        </div>

        {isEditing && (
          <Button width="100%" onClick={handleSave}>Save Changes</Button>
        )}
      </div>
    </Container>
  );
}

ProfileForm.Layout = UserLayout