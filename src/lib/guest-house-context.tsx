import { createContext, useContext, useState, type ReactNode } from "react";

export type GuestHouse = "greater-heights" | "new-heights";

interface GuestHouseContextType {
  activeHouse: GuestHouse;
  setActiveHouse: (house: GuestHouse) => void;
  houseName: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const GuestHouseContext = createContext<GuestHouseContextType | null>(null);

const houseData: Record<
  GuestHouse,
  { name: string; whatsapp: string; phone: string; email: string; address: string }
> = {
  "greater-heights": {
    name: "Greater Heights Guest House",
    whatsapp: "+266 5894 3042",
    phone: "+266 2232 0655",
    email: "greaterheightsbnb@gmail.com",
    address: "Monokots'oai St., Katlehong, Maseru 100, Lesotho",
  },
  "new-heights": {
    name: "New Heights Guest House",
    whatsapp: "+266 5894 3042",
    phone: "+266 2232 0655",
    email: "greaterheightsbnb@gmail.com",
    address: "Maseru, Lesotho",
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
        phoneNumber: data.phone,
        email: data.email,
        address: data.address,
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
