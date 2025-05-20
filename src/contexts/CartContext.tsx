
import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  animalId: string;
  name: string;
  category?: string; // Make category optional to handle cases where it might be missing
  imageUrl: string;
  sharePrice: number;
  shares: number;
  totalPrice: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateShareCount: (id: string, shares: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    // Check if the item (same animal and share) already exists in the cart
    const existingItemIndex = items.findIndex(
      (cartItem) => cartItem.animalId === item.animalId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        shares: updatedItems[existingItemIndex].shares + item.shares,
        totalPrice: updatedItems[existingItemIndex].totalPrice + item.totalPrice,
      };
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${item.animalId}-${Date.now()}`,
        ...item,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const updateShareCount = (id: string, shares: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            shares,
            totalPrice: item.sharePrice * shares,
          };
        }
        return item;
      })
    );
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.shares, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        updateShareCount,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
