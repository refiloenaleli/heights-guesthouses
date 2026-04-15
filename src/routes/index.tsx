import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star, Users, Coffee, Shield, Wifi, Car, UtensilsCrossed, Tag } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RoomCard } from "@/components/RoomCard";
import ghExterior from "@/assets/gh-exterior.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import ghSingleRoom from "@/assets/gh-single-room.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhSingleRoom from "@/assets/nh-single-room.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
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

const features = [
  { icon: MapPin, title: "Prime Location", desc: "Centrally located for easy access to all major attractions" },
  { icon: Shield, title: "Secure & Safe", desc: "24/7 security and CCTV monitoring for your peace of mind" },
  { icon: Users, title: "Friendly Staff", desc: "Our welcoming team ensures a seamless, personalised experience" },
  { icon: Star, title: "Best Value", desc: "Enjoy unbeatable prices with fantastic offers tailored for you" },
];

const amenities = [
  { icon: Wifi, title: "High Speed WiFi" },
  { icon: Car, title: "Free Parking" },
  { icon: UtensilsCrossed, title: "Restaurant" },
  { icon: Coffee, title: "Room Service" },
  { icon: Shield, title: "24/7 Security" },
  { icon: Users, title: "Conference Rooms" },
];

function HomePage() {
  const { activeHouse, houseName } = useGuestHouse();
  const heroImage = activeHouse === "greater-heights" ? ghExterior : nhExterior1;
  const welcomeImages = activeHouse === "greater-heights"
    ? [ghCoupleRoom, ghSingleRoom]
    : [nhCoupleRoom, nhSingleRoom];
  const diningImage = activeHouse === "greater-heights" ? ghOutdoorDining : nhDining2;

  const [rooms, setRooms] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("room_prices").select("*").eq("guest_house", activeHouse).order("display_order").then(({ data }) => {
      setRooms(data || []);
    });
    supabase.from("promotions").select("*").eq("guest_house", activeHouse).eq("is_active", true).then(({ data }) => {
      setPromotions(data || []);
    });
  }, [activeHouse]);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] -mt-[88px]">
        <img src={heroImage} alt={houseName} className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-4 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-warm-white font-normal tracking-wide mb-4">
              {houseName.toUpperCase()}
            </h1>
            <p className="max-w-xl mx-auto text-warm-white/80 text-sm md:text-base mb-8 leading-relaxed">
              Experience luxury accommodation in the heart of Lesotho. Modern rooms, exceptional service, and unforgettable hospitality.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/accommodation" className="btn-gold">Explore</Link>
              <Link to="/booking" className="btn-gold-outline text-warm-white border-warm-white/50 hover:bg-warm-white hover:text-charcoal">
                Book Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <section className="py-8 bg-gold-dark">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <Tag className="h-5 w-5 text-warm-white" />
              {promotions.map((promo) => (
                <div key={promo.id} className="text-center">
                  <span className="text-warm-white font-heading text-lg">{promo.title}</span>
                  {promo.discount_percentage > 0 && (
                    <span className="ml-2 bg-warm-white text-gold-dark px-2 py-0.5 text-xs font-bold">
                      {promo.discount_percentage}% OFF
                    </span>
                  )}
                  {promo.description && (
                    <p className="text-warm-white/80 text-xs mt-1">{promo.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <f.icon className="mx-auto h-8 w-8 text-gold-dark mb-3" />
                <h3 className="font-heading text-base text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-3">
              <img src={welcomeImages[0]} alt="Room" loading="lazy" className="w-full h-48 object-cover" />
              <img src={welcomeImages[1]} alt="Suite" loading="lazy" className="w-full h-48 object-cover mt-6" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="section-label">Welcome to {houseName}</span>
              <h2 className="section-title mt-2 mb-4">Luxury guest house in the heart of Lesotho</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {houseName}, located in the heart of Maseru, offers modern, luxurious rooms
                designed for comfort and relaxation. Our friendly staff ensures a seamless,
                personalised experience with stunning views. Discover true luxury and
                hospitality with us.
              </p>
              <Link to="/accommodation" className="btn-gold-outline inline-block">Read More →</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="section-label">Exquisite & Luxurious</span>
            <h2 className="section-title mt-2">Room & Suite Collection</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Amenities */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="section-label">Modern & Comfortable</span>
            <h2 className="section-title mt-2">Facilities & Amenities</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {amenities.map((a) => (
              <div key={a.title} className="flex items-center gap-3">
                <a.icon className="h-6 w-6 text-gold-dark flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining CTA */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={diningImage} alt="Dining" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <span className="section-label text-gold-light mb-2">Fine Dining</span>
          <h2 className="font-heading text-3xl md:text-5xl text-warm-white mb-4">Explore Our Dining Experience</h2>
          <Link to="/dining" className="btn-gold">View Menu</Link>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/26600000000?text=Hello%2C%20I%20would%20like%20to%20make%20a%20booking"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
