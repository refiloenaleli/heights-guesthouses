import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useSiteImage, useSiteImageList } from "@/lib/site-images-context";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ChevronLeft, ChevronRight, Download, X, ArrowLeft } from "lucide-react";
import diningInterior from "@/assets/dining.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import ghDining from "@/assets/gh-dining.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";
import nhDining1 from "@/assets/nh-dining1.jpg";

type MenuItem = Tables<"menu_items">;
type DiningBanner = Tables<"dining_banners">;
type MenuImage = Tables<"menu_images">;

export const Route = createFileRoute("/dining")({
  component: DiningPage,
});

function DiningPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [banners, setBanners] = useState<DiningBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [menuImages, setMenuImages] = useState<MenuImage[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuImage | null>(null);
  const heroImage = useSiteImage(
    `${activeHouse}.dining.hero`,
    activeHouse === "greater-heights" ? ghOutdoorDining : nhDining2,
  );
  const interiorImage = useSiteImage(`${activeHouse}.dining.interior`, diningInterior);

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
    let cancelled = false;

    // Fetch dining banners
    supabase
      .from("dining_banners")
      .select("*")
      .eq("guest_house", activeHouse)
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (cancelled) return;
        setBanners(data || []);
        // Reset index so a stale index can never point past the new list
        setCurrentBannerIndex(0);
      });

    supabase
      .from("menu_images")
      .select("*")
      .eq("guest_house", activeHouse)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setMenuImages(data || []);
      });

    return () => {
      cancelled = true;
    };
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
    {} as Record<string, MenuItem[]>,
  );

  // Guard against any stale/out-of-range index so rendering can never crash
  const safeBannerIndex =
    banners.length > 0
      ? ((currentBannerIndex % banners.length) + banners.length) % banners.length
      : 0;
  const currentBanner = banners[safeBannerIndex];
  const mealImageFallbacks =
    activeHouse === "greater-heights"
      ? [ghOutdoorDining, ghDining, diningInterior]
      : [nhDining2, nhDining1, diningInterior];
  const foodImages = useSiteImageList(`${activeHouse}.dining.meals`, mealImageFallbacks);
  return (
    <>
      {/* Hero Section */}
      <section className="relative -mt-[60px] h-[85vh] min-h-[600px]">
        <img src={heroImage} alt="Dining" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label text-gold-light tracking-[0.3em]">AT THE TABLE</span>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-warm-white font-normal tracking-wide mt-4 mb-4">
              Dining at the Heights
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-warm-white/80 leading-relaxed">
              Good food. Unhurried moments. A table worth lingering at.
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
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[1.05fr_0.95fr]">
          <div className="grid grid-cols-2 gap-3">
            <img
              src={interiorImage}
              alt="Dining room at the Heights"
              className="h-64 w-full object-cover md:h-80"
            />
            <img
              src={heroImage}
              alt={`${houseName} dining setting`}
              className="mt-8 h-64 w-full object-cover md:h-80"
            />
          </div>
          <div>
            <span className="section-label">FROM OUR KITCHEN</span>
            <h2 className="section-title mt-2">Good food. Beautifully shared.</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Savour gourmet dishes and refreshing cocktails at {houseName}'s elegant restaurant and
              bar.
            </p>
            <div className="mt-8 border-t border-border pt-6">
              <p className="font-accent text-2xl text-gold-dark">A table worth lingering at.</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                Breakfast · Lunch · Dinner
              </p>
            </div>
          </div>
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
          </div>

          {menuImages.length > 0 && (
            <div className="mb-16 border-y border-border py-10">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="section-label">MENUS TO EXPLORE</span>
                  <h2 className="section-title mt-2">Choose something delicious.</h2>
                </div>
                <p className="max-w-xs text-right text-xs leading-relaxed text-muted-foreground">
                  View each menu full-size or download it to keep for later.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {menuImages.slice(0, 3).map((menu) => (
                  <article key={menu.id} className="overflow-hidden border border-border bg-card">
                    <button
                      type="button"
                      onClick={() => setSelectedMenu(menu)}
                      className="block w-full text-left"
                    >
                      <img
                        src={menu.image_url}
                        alt={menu.title}
                        className="h-52 w-full object-cover"
                      />
                    </button>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <h3 className="font-heading text-lg text-foreground">{menu.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {menu.caption || "Explore our menu"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMenu(menu)}
                          className="btn-gold-outline px-3 py-2 text-[10px]"
                        >
                          View
                        </button>
                        <a
                          href={menu.image_url}
                          download={menu.title || "menu"}
                          className="btn-gold p-2"
                          aria-label={`Download ${menu.title}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mb-12 max-w-lg mx-auto">
            Savour gourmet dishes and refreshing cocktails at {houseName}'s elegant restaurant and
            bar.
          </p>

          {categories.map((meal, index) => (
            <motion.div
              key={meal}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 grid items-center gap-8 border-t border-border pt-8 md:grid-cols-2"
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <img
                  src={foodImages[index % foodImages.length]}
                  alt={`${houseName} ${meal} dining selection`}
                  className="h-64 w-full object-cover md:h-80"
                />
                <p className="font-accent mt-3 text-xl text-gold-dark">
                  {meal === "breakfast"
                    ? "Good mornings."
                    : meal === "lunch"
                      ? "Gather around the grill."
                      : "Stay for supper."}
                </p>
              </div>
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <h2 className="font-heading mb-6 border-b border-border pb-3 text-2xl text-foreground">
                  {meal === "breakfast"
                    ? "Start the day at the table."
                    : meal === "lunch"
                      ? "Gather around the grill."
                      : "Stay for supper."}
                </h2>
                <div className="space-y-4">
                  {(grouped[meal] || []).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="whitespace-nowrap text-sm font-semibold text-gold-dark">
                        {item.price}
                      </span>
                    </div>
                  ))}
                  {(!grouped[meal] || grouped[meal].length === 0) && (
                    <p className="text-xs text-muted-foreground">No items available.</p>
                  )}
                </div>
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

      <AnimatePresence>
        {selectedMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedMenu(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-[90vh] max-w-4xl overflow-auto bg-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute right-3 top-3 flex gap-2">
                <a
                  href={selectedMenu.image_url}
                  download={selectedMenu.title || "menu"}
                  className="bg-gold-dark p-2 text-warm-white"
                  aria-label={`Download ${selectedMenu.title}`}
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMenu(null)}
                  className="bg-charcoal/90 p-2 text-warm-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <img
                src={selectedMenu.image_url}
                alt={selectedMenu.title}
                className="max-h-[85vh] w-full object-contain"
              />
              <p className="p-4 font-heading text-xl text-foreground">{selectedMenu.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
