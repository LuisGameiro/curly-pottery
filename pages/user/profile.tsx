import { useState } from 'react';
import { Container, Text, Button, Input } from "@components/ui";
import { MapPin, Package, Settings } from "lucide-react";
import { useUser } from '@lib/hooks/useUser';

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');

  return (
    <Container className="py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="mb-8 px-4">
            <Text className="font-bold text-xl">{user?.name}</Text>
            <Text className="text-slate-500 text-sm">{user?.email}</Text>
          </div>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
          >
            <Package size={18} /> My Orders
          </button>
          <button 
            onClick={() => setActiveTab('address')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'address' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
          >
            <MapPin size={18} /> Addresses
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white border rounded-3xl p-8">
          {/* {activeTab === 'orders' ? <OrderHistory /> : <AddressSettings />} */}
        </main>
      </div>
    </Container>
  );
}