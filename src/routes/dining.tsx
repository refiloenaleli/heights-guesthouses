import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";

export const Route = createFileRoute("/dining")({
  component: DiningPage,
});

function DiningPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [menuImage, setMenuImage] = useState<any>(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const heroImage = activeHouse === "greater-heights" ? ghOutdoorDining : nhDining2;

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .eq("guest_house", activeHouse)
      .order("display_order")
      .then(({ data }) => {
        setMenuItems(data || []);
      });
  }, [activeHouse]);

  useEffect(() => {
    // Fetch dining banners
    supabase
      .from("dining_banners")
      .select("*")
      .eq("guest_house", activeHouse)
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        setBanners(data || []);
      });

    // Fetch menu image
    supabase
      .from("menu_images")
      .select("*")
      .eq("guest_house", activeHouse)
      .eq("is_active", true)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMenuImage(data[0]);
        }
      });
  }, [activeHouse]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const categories = ["breakfast", "lunch", "dinner"];
  const grouped = categories.reduce(
    (acc, cat) => {
      acc[cat] = menuItems.filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const currentBanner = banners[currentBannerIndex];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px]">
        <img src={heroImage} alt="Dining" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <span className="section-label text-gold-light">AT THE TABLE</span>
          <h1 className="section-title text-warm-white mt-2">Dining at the Heights</h1>
          <p className="mt-4 max-w-xl text-sm text-warm-white/80">
            Good food. Unhurried moments. A table worth lingering at.
          </p>
        </div>
      </section>

      {/* Banner Slideshow */}
      {banners.length > 0 && (
        <section className="relative h-[60vh] min-h-[400px] bg-charcoal overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBannerIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {currentBanner.image_url ? (
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal to-charcoal-light">
                  <div className="text-center px-4">
                    <h2 className="font-heading text-3xl md:text-4xl text-warm-white mb-4">
                      {currentBanner.title}
                    </h2>
                    {currentBanner.description && (
                      <p className="text-warm-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        {currentBanner.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Overlay for images */}
              {currentBanner.image_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              )}
              {/* Text overlay on images */}
              {currentBanner.image_url && (
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center">
                  <h2 className="font-heading text-3xl md:text-4xl text-warm-white mb-4">
                    {currentBanner.title}
                  </h2>
                  {currentBanner.description && (
                    <p className="text-warm-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                      {currentBanner.description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBannerIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentBannerIndex
                      ? "bg-gold scale-110"
                      : "bg-warm-white/40 hover:bg-warm-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Arrow navigation */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-warm-white p-2 hover:bg-black/50 transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-warm-white p-2 hover:bg-black/50 transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </section>
      )}

      {/* Menu Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <span className="section-label">Our Menu</span>
            <span className="section-label block mt-2">GOOD MORNINGS</span>
            <h2 className="section-title mt-2">Start the day at the table.</h2>
            {menuImage && (
              <div className="mt-4">
                <button
                  onClick={() => setMenuModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs text-gold-dark hover:text-gold underline underline-offset-4"
                >
                  <img
                    src={menuImage.image_url}
                    alt={menuImage.title}
                    className="h-16 w-auto object-contain border border-border rounded"
                  />
                  <span>Click to view full menu</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mb-12 max-w-lg mx-auto">
            Savour gourmet dishes and refreshing cocktails at {houseName}'s elegant restaurant and
            bar.
          </p>

          {categories.map((meal) => (
            <motion.div
              key={meal}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-heading text-2xl text-foreground mb-6 border-b border-border pb-3">
                {meal === "breakfast"
                  ? "Start the day at the table."
                  : meal === "lunch"
                    ? "Gather around the grill."
                    : "Stay for supper."}
              </h2>
              <div className="space-y-4">
                {(grouped[meal] || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-gold-dark whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                ))}
                {(!grouped[meal] || grouped[meal].length === 0) && (
                  <p className="text-xs text-muted-foreground">No items available.</p>
                )}
              </div>
            </motion.div>
          ))}

          <div className="border-t border-border pt-8">
            <h2 className="font-heading text-2xl text-foreground">Gather around the grill.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Undercover barbecue facilities are available for gatherings.
            </p>
          </div>
        </div>
      </section>

      <p className="font-accent bg-cream px-4 py-16 text-center text-2xl text-gold-dark">
        Come hungry. Leave with another reason to return.
      </p>

      {/* Menu Image Modal */}
      <AnimatePresence>
        {menuModalOpen && menuImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setMenuModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <a
                  href={menuImage.image_url}
                  download={menuImage.title || "menu"}
                  className="bg-gold-dark text-warm-white p-2 hover:bg-gold transition-colors"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={() => setMenuModalOpen(false)}
                  className="bg-charcoal/80 text-warm-white p-2 hover:bg-charcoal transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <img src={menuImage.image_url} alt={menuImage.title} className="w-full h-auto" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
