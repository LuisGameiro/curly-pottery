import { useState, useEffect, useMemo } from 'react';
import { useUser } from './useUser';

export default function useCart() {
  const { isAuthenticated, user } = useUser();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        // Fetch from Prisma API
        const res = await fetch('/api/cart');
        const data = await res.json();
        setCartItems(data.items || []);
      } else {
        // Load from LocalStorage
        const localData = localStorage.getItem('cart');
        if (localData) setCartItems(JSON.parse(localData));
      }
      setIsLoading(false);
    };
    loadCart();
  }, [isAuthenticated]);

  // Sync to LocalStorage/API whenever items change
  const updateCartState = async (newItems: any[]) => {
    setCartItems(newItems);
    if (isAuthenticated) {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ items: newItems }),
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const addItem = (item: any) => {
    const existing = cartItems.find((i) => i.variantId === item.variantId);
    if (existing) {
      updateCartState(cartItems.map(i => 
        i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      updateCartState([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    updateCartState(cartItems.filter((i) => i.id !== id));
  };

  const subtotal = useMemo(() => 
    cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), 
  [cartItems]);

  return {
    data: {
      lineItems: cartItems,
      subtotalPrice: subtotal,
      totalPrice: subtotal, // Add tax logic if needed
      currency: { code: 'GBP' }
    },
    isLoading,
    isEmpty: cartItems.length === 0,
    addItem,
    removeItem,
    updateItem: (id: string, q: number) => {
        updateCartState(cartItems.map(i => i.id === id ? {...i, quantity: q} : i))
    }
  };
}