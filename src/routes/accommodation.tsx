import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";
import { RoomCard } from "@/components/RoomCard";
import ghSingleRoom from "@/assets/gh-single-room.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import nhSingleRoom from "@/assets/nh-single-room.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";

export const Route = createFileRoute("/accommodation")({
  component: AccommodationPage,
});

const roomImages: Record<string, Record<string, string>> = {
  "greater-heights": {
    "Single Room": ghSingleRoom,
    "Couple Room": ghCoupleRoom,
    "Sharing Room": ghSharingRoom,
    "Conference & Banqueting": ghDining,
  },
  "new-heights": {
    "Single Room": nhSingleRoom,
    "Couple Room": nhCoupleRoom,
    "Sharing Room": nhSharingRoom,
    "Conference & Banqueting": nhDining1,
  },
};

function AccommodationPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("room_prices").select("*").eq("guest_house", activeHouse).order("display_order").then(({ data }) => {
      setRooms(data || []);
    });
  }, [activeHouse]);

  return (
    <>
      <section className="bg-charcoal py-20 text-center">
        <span className="section-label text-gold-light">Exquisite & Luxurious</span>
        <h1 className="section-title text-warm-white mt-2">Accommodation</h1>
        <p className="mt-3 text-sm text-warm-white/60 max-w-lg mx-auto">
          Discover our collection of beautifully appointed rooms at {houseName}
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {rooms.map((room, i) => (
              <RoomCard
                key={room.id}
                title={room.room_type}
                price={room.price}
                priceNote={room.price_note}
                description={room.description}
                image={roomImages[activeHouse]?.[room.room_type] || ghSingleRoom}
                features={room.features || []}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <span className="section-label">Transparent Pricing</span>
            <h2 className="section-title mt-2">Room Rates</h2>
          </div>
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal text-warm-white">
                  <th className="text-left px-6 py-4 text-xs tracking-widest uppercase">Room Type</th>
                  <th className="text-right px-6 py-4 text-xs tracking-widest uppercase">Rate per Night</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{r.room_type}</td>
                    <td className="px-6 py-4 text-sm text-right text-gold-dark font-semibold">{r.price}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
