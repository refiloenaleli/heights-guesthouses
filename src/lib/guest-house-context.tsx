import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [contactOverrides, setContactOverrides] = useState<Partial<(typeof houseData)[GuestHouse]>>({});

  useEffect(() => {
    let cancelled = false;
    const loadContactSettings = () => {
      cancelled = false;
      void Promise.resolve(
        supabase
          .from("contact_settings")
          .select("phone, email, whatsapp, address")
          .eq("guest_house", activeHouse)
          .maybeSingle()
          .then(({ data }) => {
        if (cancelled || !data) return;
          const defaults = houseData[activeHouse];
          const isPlaceholderPhone = (value: string) => {
            const digits = value.replace(/\D/g, "");
            return digits.startsWith("266000000") || /^0{8,}$/.test(digits);
          };
          const isPlaceholderEmail = (value: string) => value.trim().toLowerCase().startsWith("info@");
        setContactOverrides({
            phone: isPlaceholderPhone(data.phone) ? defaults.phone : data.phone,
            email: isPlaceholderEmail(data.email) ? defaults.email : data.email,
            whatsapp: isPlaceholderPhone(data.whatsapp) ? defaults.whatsapp : data.whatsapp,
          address: data.address,
        });
          }),
      ).catch(() => undefined);
    };
    const handleContactSettingsUpdated = (event: Event) => {
      const updatedHouse = (event as CustomEvent<string>).detail;
      if (updatedHouse === activeHouse) loadContactSettings();
    };
    loadContactSettings();
    window.addEventListener("contact-settings-updated", handleContactSettingsUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("contact-settings-updated", handleContactSettingsUpdated);
      setContactOverrides({});
    };
  }, [activeHouse]);

  const data = { ...houseData[activeHouse], ...contactOverrides };

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
