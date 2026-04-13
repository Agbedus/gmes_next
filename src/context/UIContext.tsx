"use client";

import React, { createContext, useContext, useState } from "react";

type UIContextType = {
  isMapOpen: boolean;
  setIsMapOpen: (open: boolean) => void;
  isChartsOpen: boolean;
  setIsChartsOpen: (open: boolean) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isMapOpen, setIsMapOpen, isChartsOpen, setIsChartsOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
