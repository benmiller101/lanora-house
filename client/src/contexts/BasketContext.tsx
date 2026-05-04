import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BasketItem = {
  productId: number;
  name: string;
  price: string;
  imageUrl?: string;
};

type BasketContextType = {
  items: BasketItem[];
  addItem: (item: BasketItem) => boolean;
  removeItem: (productId: number) => void;
  clearBasket: () => void;
  isInBasket: (productId: number) => boolean;
  itemCount: number;
  subtotal: number;
};

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const STORAGE_KEY = "lanora_basket";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
    }
  }, [items]);

  const isInBasket = (productId: number) => {
    return items.some((i) => i.productId === productId);
  };

  const addItem = (item: BasketItem): boolean => {
    if (isInBasket(item.productId)) {
      return false;
    }
    setItems((prev) => [...prev, item]);
    return true;
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearBasket = () => {
    setItems([]);
  };

  const itemCount = items.length;

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);

  return (
    <BasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearBasket,
        isInBasket,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
