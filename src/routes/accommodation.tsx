import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AirVent, Building2, Coffee, Refrigerator, Users, ArrowLeft } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";
import { RoomCard } from "@/components/RoomCard";
import { RoomModal } from "@/components/RoomModal";
import ghSingleRoom from "@/assets/gh-single-room.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import nhSingleRoom from "@/assets/nh-single-room.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";

export const Route = createFileRoute("/accommodation")({ component: AccommodationPage });

const roomImages: Record<string, Record<string, string>> = {
  "greater-heights": {
    "Single Room": ghSingleRoom,
    "Couple Room": ghCoupleRoom,
    "Sharing Room": ghSharingRoom,
    "Executive Room": ghSingleRoom,
    "Conference & Banqueting": ghDining,
  },
  "new-heights": {
    "Single Room": nhSingleRoom,
    "Couple Room": nhCoupleRoom,
    "Sharing Room": nhSharingRoom,
    "Executive Room": nhSingleRoom,
    "Conference & Banqueting": nhDining1,
  },
};

const roomRates: Record<string, string> = {
  "Single Room": "M600.00",
  "Couple Room": "M700.00",
  "Sharing Room": "M750.00",
  "Executive Room": "M850.00",
};

const roomAccents: Record<string, string> = {
  "Single Room": "A peaceful pause.",
  "Couple Room": "Made for slowing down together.",
  "Sharing Room": "Comfort, shared.",
  "Executive Room": "A little more room to settle in.",
};

type RoomRecord = {
  id: string;
  room_type: string;
  price: string;
  price_note?: string;
  description: string;
  long_description?: string;
  bed_info?: string;
  features: string[];
};

const defaultRooms: Omit<RoomRecord, "id">[] = [
  {
    room_type: "Single Room",
    price: "M600.00",
    price_note: "per night",
    description:
      "A peaceful, comfortable room for solo travellers, with everything you need for a restful stay.",
    features: ["1 Single Bed", "En-Suite Bathroom", "Breakfast Included", "Tea/Coffee Facilities"],
  },
  {
    room_type: "Couple Room",
    price: "M700.00",
    price_note: "per night",
    description:
      "A warm and inviting retreat for couples, with generous space and thoughtful amenities.",
    features: ["1 King Bed", "En-Suite Bathroom", "Breakfast Included", "Mini-Fridge"],
  },
  {
    room_type: "Sharing Room",
    price: "M750.00",
    price_note: "per night",
    description:
      "Spacious accommodation for friends or colleagues travelling together without compromising comfort.",
    features: [
      "2 Single Beds",
      "En-Suite Bathroom",
      "Breakfast Included",
      "Individual Reading Lights",
    ],
  },
  {
    room_type: "Executive Room",
    price: "M850.00",
    price_note: "per night",
    description:
      "Our premium room with extra space, elevated amenities, and a more spacious setting.",
    features: [
      "Super King Bed",
      "En-Suite Bathroom",
      "Breakfast Included",
      "Separate Sitting Area",
    ],
  },
];

function AccommodationPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Admin-uploaded images per room type (from the "Room Images" dashboard tab).
  const [dbRoomImages, setDbRoomImages] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("room_prices")
      .select("*")
      .eq("guest_house", activeHouse)
      .order("display_order")
      .then(({ data }) => {
        const savedRooms = data || [];
        const savedByType = new Map(savedRooms.map((room) => [room.room_type, room]));
        setRooms(
          defaultRooms.map((room) => {
            const saved = savedByType.get(room.room_type);
            if (!saved) return { ...room, id: `${activeHouse}-${room.room_type}` };
            return {
              id: saved.id,
              room_type: saved.room_type,
              price: saved.price,
              price_note: saved.price_note ?? undefined,
              description: saved.description,
              long_description: saved.long_description ?? undefined,
              bed_info: saved.bed_info ?? undefined,
              features: saved.features,
            };
          }),
        );
      });
  }, [activeHouse]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("room_images")
      .select("room_type, image_url")
      .eq("guest_house", activeHouse)
      .order("display_order")
      .then(({ data }) => {
        if (cancelled) return;
        const byType: Record<string, string> = {};
        for (const row of data || []) {
          // First image for each room type wins (display order respected)
          if (!byType[row.room_type]) byType[row.room_type] = row.image_url;
        }
        setDbRoomImages(byType);
      });
    return () => {
      cancelled = true;
    };
  }, [activeHouse]);

  /** Admin-managed room image if uploaded, otherwise the built-in default. */
  const imageFor = (roomType: string): string =>
    dbRoomImages[roomType] || roomImages[activeHouse]?.[roomType] || ghSingleRoom;

  const openRoomModal = (room: RoomRecord) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const accommodationRooms = rooms.filter((room) => room.room_type !== "Conference & Banqueting");
  const heroImage = imageFor("Executive Room");

  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden bg-charcoal">
        <img
          src={heroImage}
          alt={`${houseName} executive room`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-6xl items-end px-4 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label text-gold-light">
              {activeHouse === "greater-heights"
                ? "GREATER HEIGHTS · KATLEHONG"
                : "NEW HEIGHTS · KHUBETSOANA"}
            </span>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-normal text-warm-white md:text-6xl">
              {activeHouse === "greater-heights"
                ? "Stay at Greater Heights Guest House"
                : "More room for what matters."}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-warm-white/80 md:text-base">
              {activeHouse === "greater-heights"
                ? "Refined Comfort & Modern Hospitality. Thoughtfully appointed rooms, restful surroundings, and warm service in the heart of Maseru."
                : "Comfortable stays, generous spaces and hospitality designed for groups, business and events."}
            </p>
          </motion.div>
        </div>
      </section>
      {/* Back to Properties */}
      <div className="bg-charcoal/95 border-b border-gold/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-light/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All Properties
          </Link>
        </div>
      </div>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">
              {activeHouse === "greater-heights"
                ? "THE HEIGHTS STAY"
                : "THE NEW HEIGHTS EXPERIENCE"}
            </span>
            <h2 className="section-title mt-2 mb-5">
              {activeHouse === "greater-heights"
                ? "Comfort, considered in every detail."
                : "Stay comfortably. Gather confidently."}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {activeHouse === "greater-heights"
                ? "Designed for seamless relaxation, our 10 air-conditioned rooms feature private en-suite bathrooms, mini-bar refrigerators, and complimentary tea and coffee setups. With flexible bedding configurations (double, ¾, or single), we comfortably accommodate up to 25 guests at full sharing capacity."
                : "Comfortable stays, generous spaces and warm hospitality for groups, business travellers and events."}
            </p>
            {activeHouse === "greater-heights" && (
              <div className="mt-8 grid grid-cols-2 gap-5">
                {[
                  { icon: AirVent, label: "10 air-conditioned rooms" },
                  { icon: Refrigerator, label: "Mini-bar refrigerators" },
                  { icon: Coffee, label: "Tea & coffee station" },
                  { icon: Users, label: "Up to 25 guests sharing" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-xs font-medium text-foreground"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-gold-dark" />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src={imageFor("Couple Room")}
              alt="Comfortable guest room"
              className="h-[360px] w-full object-cover md:h-[440px]"
            />
            <div className="font-accent absolute bottom-5 left-5 bg-charcoal px-4 py-3 text-xl text-gold-light">
              {activeHouse === "greater-heights"
                ? "Rest well. Wake refreshed."
                : "Arrive together. Stay connected."}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-label">YOUR STAY, YOUR WAY</span>
              <h2 className="section-title mt-2">Choose your room</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Rooms for every kind of stay. All rates include breakfast. Select a room image to
              explore its details and gallery.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {accommodationRooms.map((room, i) => (
              <div key={room.id}>
                <RoomCard
                  title={room.room_type}
                  price={roomRates[room.room_type] || room.price}
                  priceNote="per night"
                  description={room.description}
                  image={imageFor(room.room_type)}
                  features={room.features || []}
                  index={i}
                  onViewRoom={() =>
                    openRoomModal({ ...room, price: roomRates[room.room_type] || room.price })
                  }
                />
                <p className="font-accent mt-3 text-center text-xl text-gold-dark">
                  {roomAccents[room.room_type]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-warm-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="section-label text-gold-light">
              {activeHouse === "greater-heights" ? "MEETINGS & EVENTS" : "EVENTS AT SCALE"}
            </span>
            <h2 className="section-title mt-2 text-warm-white">
              Conference facilities with room to think.
            </h2>
          </div>
          <div className="border-l border-gold/40 pl-6 md:pl-10">
            <Building2 className="mb-4 h-8 w-8 text-gold" />
            <p className="max-w-2xl text-sm leading-relaxed text-warm-white/75 md:text-base">
              Our two conference rooms accommodate up to 50 delegates in table seating or 80
              delegates in cinema-style seating. A private venue is also available for smaller,
              confidential meetings, with flexible arrangements to suit your gathering.
            </p>
            {activeHouse === "greater-heights" && (
              <p className="font-accent mt-6 text-2xl text-gold-light">
                Bring people together. Give ideas room to grow.
              </p>
            )}
            {activeHouse === "new-heights" && (
              <>
                <h3 className="section-title mt-8 text-warm-white">
                  A room for every kind of gathering.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-white/75 md:text-base">
                  From focused meetings to major conferences, New Heights gives your event the space
                  and flexibility it deserves.
                </p>
                <p className="font-accent mt-6 text-2xl text-gold-light">UP TO 300 DELEGATES</p>
              </>
            )}
            <Link to="/contact" className="btn-gold mt-7 inline-block">
              Discuss your event
            </Link>
          </div>
        </div>
      </section>

      {selectedRoom && (
        <RoomModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          room={{
            ...selectedRoom,
            image: imageFor(selectedRoom.room_type),
          }}
          activeHouse={activeHouse}
        />
      )}
    </>
  );
}
