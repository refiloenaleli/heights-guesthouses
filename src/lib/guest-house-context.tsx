import { createContext, useContext, useState, type ReactNode } from "react";

export type GuestHouse = "greater-heights" | "new-heights";

interface GuestHouseContextType {
  activeHouse: GuestHouse;
  setActiveHouse: (house: GuestHouse) => void;
  houseName: string;
  whatsappNumber: string;
  email: string;
}

const GuestHouseContext = createContext<GuestHouseContextType | null>(null);

const houseData: Record<GuestHouse, { name: string; whatsapp: string; email: string }> = {
  "greater-heights": {
    name: "Greater Heights Guest House",
    whatsapp: "+26600000000",
    email: "info@greaterheights.co.ls",
  },
  "new-heights": {
    name: "New Heights Guest House",
    whatsapp: "+26600000001",
    email: "info@newheights.co.ls",
  },
};

export function GuestHouseProvider({ children }: { children: ReactNode }) {
  const [activeHouse, setActiveHouse] = useState<GuestHouse>("greater-heights");
  const data = houseData[activeHouse];

  return (
    <GuestHouseContext.Provider
      value={{
        activeHouse,
        setActiveHouse,
        houseName: data.name,
        whatsappNumber: data.whatsapp,
        email: data.email,
      }}
    >
      {children}
    </GuestHouseContext.Provider>
  );
}

export function useGuestHouse() {
  const ctx = useContext(GuestHouseContext);
  if (!ctx) throw new Error("useGuestHouse must be used within GuestHouseProvider");
  return ctx;
}
